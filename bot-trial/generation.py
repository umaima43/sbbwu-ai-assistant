"""
generation.py
Production-grade generation pipeline for the SBBWU RAG chatbot.

Takes a RetrievalResult (see retrieval.py) and produces a grounded,
hallucination-resistant answer. Reads all LLM configuration from
environment variables (.env) — no keys are ever hardcoded, logged,
or printed.

Provider: Groq (llama-3.3-70b-versatile by default), using the official
`groq` SDK. Credentials are loaded from groq.env (GROQ_API_KEY). The
Groq SDK mirrors the OpenAI client shape, so if you ever switch providers
again, only `_get_client()` / `_call_llm()` need to change — everything
else in this file (config, prompts, fallback logic, orchestration) stays
provider-agnostic.
"""

from __future__ import annotations

from pathlib import Path

import os
import re
import time
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

try:
    from dotenv import load_dotenv
    # Use an absolute path anchored to this file's directory so groq.env is
    # found regardless of which directory the server process is launched from.
    _env_path = Path(__file__).parent / "groq.env"
    load_dotenv(_env_path)
    load_dotenv()  # also honour a plain .env or already-set env vars
except ImportError:
    # python-dotenv is not installed — manually parse groq.env so the key
    # is always available regardless of the host environment.
    _env_path = Path(__file__).parent / "groq.env"
    if _env_path.exists():
        for _raw_line in _env_path.read_text(encoding="utf-8").splitlines():
            _line = _raw_line.strip()
            if not _line or _line.startswith("#") or "=" not in _line:
                continue
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

from groq import Groq, APIError, APIConnectionError, RateLimitError

from retrieval import RetrievalResult, RetrievedChunk
from prompts import PromptBuilder, build_user_prompt


# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("generation")


# =============================================================================
# CONFIG  (all values come from .env — nothing hardcoded)
# =============================================================================

@dataclass
class GenerationConfig:
    api_key: str = field(default_factory=lambda: os.getenv("GROQ_API_KEY", ""))
    model: str = field(default_factory=lambda: os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"))
    temperature: float = field(default_factory=lambda: float(os.getenv("LLM_TEMPERATURE", "0.2")))
    max_tokens: int = field(default_factory=lambda: int(os.getenv("LLM_MAX_TOKENS", "600")))
    timeout: float = field(default_factory=lambda: float(os.getenv("LLM_TIMEOUT", "20")))
    max_retries: int = field(default_factory=lambda: int(os.getenv("LLM_MAX_RETRIES", "3")))

    def validate(self) -> None:
        if not self.api_key:
            raise GenerationError(
                "GROQ_API_KEY is not set. Add it to groq.env — never hardcode it in source."
            )


class GenerationError(Exception):
    """Raised for any unrecoverable failure in the generation pipeline."""


# =============================================================================
# OUTPUT TYPE
# =============================================================================

@dataclass
class GenerationResult:
    answer: str
    used_fallback: bool
    confidence: float
    sources: List[str] = field(default_factory=list)
    validation_failed_rules: List[str] = field(default_factory=list)


# =============================================================================
# LLM CLIENT
# =============================================================================

_client: Optional[Groq] = None


def _get_client(config: GenerationConfig) -> Groq:
    global _client
    if _client is None:
        config.validate()
        _client = Groq(api_key=config.api_key, timeout=config.timeout)
    return _client


def _call_llm(system_prompt: str, user_prompt: str, config: GenerationConfig) -> str:
    """Calls the chat completion endpoint with retry/backoff. Raises GenerationError on
    unrecoverable failure. Never logs the API key or full raw request/response bodies."""
    client = _get_client(config)

    last_error: Optional[Exception] = None
    for attempt in range(1, config.max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=config.model,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return response.choices[0].message.content.strip()

        except RateLimitError as e:
            last_error = e
            wait = 2 ** attempt
            logger.warning("Rate limited (attempt %d/%d), retrying in %ds", attempt, config.max_retries, wait)
            time.sleep(wait)

        except APIConnectionError as e:
            last_error = e
            logger.warning("Connection error (attempt %d/%d): %s", attempt, config.max_retries, e)
            time.sleep(1.5 * attempt)

        except APIError as e:
            # Non-retriable class of error (bad request, auth, etc.) — fail fast.
            logger.error("LLM API error: %s", e)
            raise GenerationError(f"LLM request failed: {e}") from e

    logger.error("LLM call failed after %d attempts", config.max_retries)
    raise GenerationError(f"LLM request failed after {config.max_retries} attempts") from last_error


# =============================================================================
# QUERY REWRITING (for conversation-aware retrieval)
# =============================================================================

_QUERY_REWRITE_SYSTEM_PROMPT = (
    "You rewrite a user's follow-up message into a single, standalone question "
    "that includes all context needed to understand it on its own, using the "
    "prior conversation. Only output the rewritten question — no explanation, "
    "no quotes. If the message is already standalone, return it unchanged."
)


def rewrite_query(
    query: str,
    conversation_history: Optional[List[dict]],
    config: Optional[GenerationConfig] = None,
) -> str:
    """Turns a context-dependent follow-up (e.g. "What's their email?") into
    a standalone question retrieval can actually search on (e.g. "What's the
    Vice Chancellor's email?"). Falls back to the original query on any
    failure — a bad rewrite should never break the whole request."""
    if not conversation_history:
        return query

    config = config or GenerationConfig()
    history_text = "\n".join(f"{t['role'].upper()}: {t['content']}" for t in conversation_history[-4:])
    user_prompt = f"CONVERSATION:\n{history_text}\n\nFOLLOW-UP MESSAGE:\n{query}\n\nRewritten standalone question:"

    try:
        rewritten = _call_llm(_QUERY_REWRITE_SYSTEM_PROMPT, user_prompt, config)
        rewritten = rewritten.strip().strip('"')
        return rewritten or query
    except GenerationError:
        logger.warning("Query rewrite failed; using original query as-is")
        return query


# =============================================================================
# RESPONSE VALIDATION
# =============================================================================
#
# A rule-based safety net that runs AFTER the LLM answers and BEFORE that
# answer leaves generation.py. It uses no LLM calls — every check is a cheap,
# deterministic function over the answer text and the RetrievalResult that
# produced it. This is intentionally a second, independent layer of defense:
# retrieval.py already estimates confidence and prompts.py already instructs
# the model not to hallucinate, but neither of those can guarantee the model
# followed instructions. This layer checks the actual output.

@dataclass
class ValidationConfig:
    """Every threshold here is a single, named knob — tune without touching
    rule logic. Values can be overridden via environment variables so this
    stays consistent with the rest of the file's configuration style."""

    min_words: int = field(default_factory=lambda: int(os.getenv("VALIDATION_MIN_WORDS", "4")))
    max_words: int = field(default_factory=lambda: int(os.getenv("VALIDATION_MAX_WORDS", "350")))

    # Below this retrieval confidence, the answer is replaced with a fallback
    # regardless of how well-formed it looks. Deliberately separate from
    # retrieval.py's own min_confidence — this is a second, independent gate.
    min_confidence_threshold: float = field(
        default_factory=lambda: float(os.getenv("VALIDATION_MIN_CONFIDENCE", "0.20"))
    )

    # Fraction of the answer's meaningful words that must also appear
    # somewhere in the retrieved context. Low = the model likely answered
    # from outside the provided material.
    min_keyword_overlap: float = field(
        default_factory=lambda: float(os.getenv("VALIDATION_MIN_KEYWORD_OVERLAP", "0.15"))
    )

    hallucination_phrases: Tuple[str, ...] = (
        "i think", "i guess", "i believe", "probably", "maybe",
        "it's possible that", "i'm not sure but", "i assume",
    )

    # A short answer is only forgiven if it looks like a legitimate short
    # fact (a phone number, an email, a yes/no) rather than a truncated or
    # evasive response.
    short_answer_allow_patterns: Tuple[str, ...] = (
        r"\d",              # contains a digit (phone, date, count, fee)
        r"@",                # contains an email
        r"^(yes|no)\b",      # direct yes/no answer
    )

    # Common English stopwords excluded from keyword-overlap comparison so
    # the ratio reflects meaningful content words, not "the"/"is"/"and".
    stopwords: frozenset = frozenset({
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "and",
        "or", "but", "in", "on", "at", "to", "for", "of", "with", "as",
        "by", "this", "that", "it", "its", "their", "your", "you", "i",
        "we", "can", "will", "would", "should", "please", "here", "there",
    })


@dataclass
class ValidationResult:
    """Structured outcome of running all rules against one answer."""
    is_valid: bool
    failed_rules: List[str] = field(default_factory=list)
    details: Dict[str, str] = field(default_factory=dict)


class ResponseValidator:
    """Runs a fixed, ordered list of rule checks over a generated answer.

    To add a new rule: write a method `_check_<name>(self, answer, result)
    -> Optional[Tuple[str, str]]` that returns None when the rule passes, or
    (rule_name, human_readable_reason) when it fails — then add it to
    `self._rules` in __init__. Nothing else in the class needs to change.
    """

    def __init__(self, config: Optional[ValidationConfig] = None):
        self.config = config or ValidationConfig()
        # Registry of active rules, in the order they run. Explicit list
        # (rather than reflection over method names) so the execution order
        # is obvious at a glance and easy to reorder or disable individual
        # checks during debugging.
        self._rules = [
            self._check_not_empty,
            self._check_min_length,
            self._check_max_length,
            self._check_hallucination_markers,
            self._check_confidence_threshold,
            self._check_keyword_overlap,
        ]

    # ---------------- Public API ----------------

    def validate(self, answer: str, retrieval_result: RetrievalResult) -> ValidationResult:
        failed_rules: List[str] = []
        details: Dict[str, str] = {}

        for rule in self._rules:
            outcome = rule(answer, retrieval_result)
            if outcome is not None:
                rule_name, reason = outcome
                failed_rules.append(rule_name)
                details[rule_name] = reason

        is_valid = not failed_rules
        if not is_valid:
            logger.warning("Response validation failed: %s", failed_rules)

        return ValidationResult(is_valid=is_valid, failed_rules=failed_rules, details=details)

    def build_fallback_message(self) -> str:
        """Safe message shown in place of an answer that failed validation."""
        return (
            "I found some information, but I'm not fully confident in the answer "
            "I generated. Please verify with the relevant SBBWU office, or try "
            "rephrasing your question."
        )

    # ---------------- Individual rules ----------------

    def _check_not_empty(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        if not answer or not answer.strip():
            return "empty_answer", "The generated answer was empty."
        return None

    def _check_min_length(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        words = answer.split()
        if len(words) >= self.config.min_words:
            return None
        if self._looks_like_legitimate_short_answer(answer):
            return None
        return "min_length", f"Answer has only {len(words)} word(s), below the minimum of {self.config.min_words}."

    def _check_max_length(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        words = answer.split()
        if len(words) > self.config.max_words:
            return "max_length", f"Answer has {len(words)} words, exceeding the maximum of {self.config.max_words}."
        return None

    def _check_hallucination_markers(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        lowered = answer.lower()
        for phrase in self.config.hallucination_phrases:
            if phrase in lowered:
                return "hallucination_marker", f"Answer contains uncertainty phrase: '{phrase}'."
        return None

    def _check_confidence_threshold(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        if retrieval_result.confidence < self.config.min_confidence_threshold:
            return (
                "low_confidence",
                f"Retrieval confidence {retrieval_result.confidence:.3f} is below "
                f"the validation threshold of {self.config.min_confidence_threshold:.3f}.",
            )
        return None

    def _check_keyword_overlap(self, answer: str, retrieval_result: RetrievalResult) -> Optional[Tuple[str, str]]:
        if not retrieval_result.context_text:
            return None  # nothing to compare against — not this rule's job to flag that

        answer_tokens = self._significant_tokens(answer)
        if not answer_tokens:
            return None  # e.g. a purely numeric/short answer already covered by _check_min_length

        context_tokens = self._significant_tokens(retrieval_result.context_text)
        overlap = answer_tokens & context_tokens
        ratio = len(overlap) / len(answer_tokens)

        if ratio < self.config.min_keyword_overlap:
            return (
                "low_keyword_overlap",
                f"Only {ratio:.0%} of the answer's key terms appear in the retrieved "
                f"context (minimum {self.config.min_keyword_overlap:.0%}).",
            )
        return None

    # ---------------- Helpers ----------------

    def _looks_like_legitimate_short_answer(self, answer: str) -> bool:
        return any(re.search(pattern, answer, re.IGNORECASE) for pattern in self.config.short_answer_allow_patterns)

    def _significant_tokens(self, text: str) -> set:
        words = re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
        return {w for w in words if w not in self.config.stopwords and len(w) > 2}


# =============================================================================
# FALLBACKS
# =============================================================================

def _fallback_message(result: RetrievalResult) -> str:
    if not result.chunks:
        return (
            "I couldn't find information about that in SBBWU's available records. "
            "Could you rephrase your question, or would you like me to point you to "
            "the relevant university office instead?"
        )
    return (
        "I found some possibly related information, but I'm not confident it fully "
        "answers your question. Could you clarify what you're looking for, or check "
        "with the relevant SBBWU department to be sure?"
    )


# =============================================================================
# RESPONSE FORMATTING
# =============================================================================

def _extract_sources(chunks: List[RetrievedChunk]) -> List[str]:
    seen = set()
    sources = []
    for c in chunks:
        label = c.title or c.category or c.source_id
        if label and label not in seen:
            sources.append(label)
            seen.add(label)
    return sources


# =============================================================================
# PUBLIC API
# =============================================================================

def generate_answer(
    query: str,
    result: RetrievalResult,
    config: Optional[GenerationConfig] = None,
    conversation_history: Optional[List[dict]] = None,
    prompt_builder: Optional[PromptBuilder] = None,
    validator: Optional[ResponseValidator] = None,
) -> GenerationResult:
    """Orchestrates the full generation step for a single query.

    If retrieval had no usable evidence (out_of_domain / empty), the LLM is
    skipped entirely — this both prevents hallucination and saves an API call.

    After the LLM answers, `validator` runs a set of cheap, deterministic
    rule checks (length, hallucination phrasing, confidence, keyword
    overlap with context) before the answer is handed back to chat_engine.py.
    A failed check swaps in a safe fallback rather than raising — validation
    failures are an expected, handled outcome, not an error.

    `conversation_history`, `prompt_builder`, and `validator` are all
    optional so this stays a drop-in replacement for single-turn use.
    """
    config = config or GenerationConfig()
    prompt_builder = prompt_builder or PromptBuilder()
    validator = validator or ResponseValidator()

    if result.is_out_of_domain or not result.chunks:
        logger.info("Skipping LLM call — insufficient retrieval confidence (%.3f)", result.confidence)
        return GenerationResult(
            answer=_fallback_message(result),
            used_fallback=True,
            confidence=result.confidence,
            sources=[],
        )

    system_prompt = prompt_builder.build_system_prompt()
    user_prompt = build_user_prompt(query, result, conversation_history)

    try:
        raw_answer = _call_llm(system_prompt, user_prompt, config)
    except GenerationError:
        logger.exception("Generation failed; returning safe fallback")
        return GenerationResult(
            answer=(
                "I'm having trouble generating a response right now. "
                "Please try again shortly, or contact SBBWU directly for urgent queries."
            ),
            used_fallback=True,
            confidence=result.confidence,
            sources=[],
        )

    validation_result = validator.validate(raw_answer, result)

    if not validation_result.is_valid:
        logger.info(
            "Answer failed validation (rules=%s); returning fallback instead of raw answer",
            validation_result.failed_rules,
        )
        return GenerationResult(
            answer=validator.build_fallback_message(),
            used_fallback=True,
            confidence=result.confidence,
            sources=[],
            validation_failed_rules=validation_result.failed_rules,
        )

    return GenerationResult(
        answer=raw_answer,
        used_fallback=False,
        confidence=result.confidence,
        sources=_extract_sources(result.chunks),
    )


# =============================================================================
# MANUAL SMOKE TEST (requires retrieval.py's artifacts to be present)
# =============================================================================

if __name__ == "__main__":
    from retrieval import RetrievalEngine

    engine = RetrievalEngine()
    gen_config = GenerationConfig()

    test_queries = [
        "Where can I submit my admission application?",
        "Who is the current Vice Chancellor?",
        "What's the weather like today?",  # expected: fallback, no LLM call
    ]

    for q in test_queries:
        retrieval_result = engine.retrieve(q)
        gen_result = generate_answer(q, retrieval_result, gen_config)
        print(f"\nQUERY: {q}")
        print(f"ANSWER: {gen_result.answer}")
        print(f"used_fallback={gen_result.used_fallback} sources={gen_result.sources}")
        if gen_result.validation_failed_rules:
            print(f"validation_failed_rules={gen_result.validation_failed_rules}")