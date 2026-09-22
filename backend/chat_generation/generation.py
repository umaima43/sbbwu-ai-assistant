"""
generation.py

Final answer generation layer for the SBBWU AI Assistant.

Architecture:

    Raw User Message
          |
          v
    query_understanding.py
          |
          v
    Prepared Query
          |
          v
    retrieval.py
          |
          v
    Retrieved Evidence
          |
          v
    generation.py
          |
          v
    prompts.py
          |
          v
       Groq LLM
          |
          v
      Final Answer

Responsibilities of this module:

- Receive the prepared query produced by query_understanding.py.
- Receive retrieval results and relevant conversation history.
- Build the generation prompt through prompts.py.
- Call the Groq LLM.
- Return the generated answer and useful metadata.
- Perform only lightweight technical validation.

This module does NOT:

- receive the raw user query
- rewrite or clean the user's query
- resolve follow-up references
- classify chitchat
- decide a PromptMode
- use a hard retrieval-confidence threshold
- perform keyword-based grounding checks
- maintain a separate hallucination phrase blacklist
- answer questions itself
- perform retrieval
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

from groq import (
    APIConnectionError,
    APIError,
    Groq,
    RateLimitError,
)

# Project imports
from chat_generation.retrieval import RetrievalResult, RetrievedChunk
from chat_generation.prompts import PromptBuilder, build_user_prompt


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------------

# backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# backend/groq.env
GROQ_ENV_PATH = BASE_DIR / "groq.env"


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class GenerationError(Exception):
    """Raised when final answer generation fails."""


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class GenerationConfig:
    """
    Configuration for the Groq generation layer.

    Values can be supplied directly or loaded from groq.env.
    """

    api_key: str = ""
    model: str = "openai/gpt-oss-120b"

    temperature: float = 0.2
    max_tokens: int = 600

    timeout: float = 20.0
    max_retries: int = 3

    @classmethod
    def from_environment(cls) -> "GenerationConfig":
        """
        Load generation settings from environment variables.

        groq.env is loaded when python-dotenv is available.
        """

        try:
            from dotenv import load_dotenv

            # Prefer backend/groq.env if it exists.
            if GROQ_ENV_PATH.exists():
                load_dotenv(GROQ_ENV_PATH)
            else:
                load_dotenv()

        except Exception:
            # Environment variables may already be loaded.
            pass

        return cls(
            api_key=os.getenv("GROQ_API_KEY", "").strip(),
            model=os.getenv(
                "GROQ_MODEL",
                "openai/gpt-oss-120b",
            ).strip(),
            temperature=_get_float_env(
                "LLM_TEMPERATURE",
                0.2,
            ),
            max_tokens=_get_int_env(
                "LLM_MAX_TOKENS",
                600,
            ),
            timeout=_get_float_env(
                "LLM_TIMEOUT",
                20.0,
            ),
            max_retries=_get_int_env(
                "LLM_MAX_RETRIES",
                3,
            ),
        )


def _get_float_env(name: str, default: float) -> float:
    """Safely read a float environment variable."""

    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _get_int_env(name: str, default: int) -> int:
    """Safely read an integer environment variable."""

    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default

def _get_int_env(name: str, default: int) -> int:
    """Safely read an integer environment variable."""

    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

@dataclass
class GenerationResult:
    """
    Result returned by the generation layer.

    `answer` is the final user-facing response.

    `confidence` and `is_out_of_domain` are retrieval metadata and are
    preserved for logging/UI/debugging. They are NOT used as hard gates
    for generation.

    `sources` contains source identifiers/titles from retrieved chunks
    when available.
    """

    answer: str

    confidence: float = 0.0
    is_out_of_domain: bool = False

    sources: List[str] = field(default_factory=list)

    used_fallback: bool = False

    # Useful for debugging/observability.
    retrieved_chunks: int = 0


# ---------------------------------------------------------------------------
# Groq client
# ---------------------------------------------------------------------------

_client: Optional[Groq] = None
_client_key: Optional[str] = None


def _get_client(config: GenerationConfig) -> Groq:
    """
    Return a reusable Groq client.

    The API key is never logged or printed.
    """

    global _client
    global _client_key

    if not config.api_key:
        raise GenerationError(
            "GROQ_API_KEY is not configured."
        )

    if _client is None or _client_key != config.api_key:
        try:
            _client = Groq(
                api_key=config.api_key,
                timeout=config.timeout,
            )
            _client_key = config.api_key

        except Exception as exc:
            logger.exception(
                "Failed to initialize Groq client."
            )
            raise GenerationError(
                "Could not initialize the language model client."
            ) from exc

    return _client


# ---------------------------------------------------------------------------
# Prompt preparation
# ---------------------------------------------------------------------------

def _prepare_history(
    conversation_history: Optional[Sequence[Any]],
) -> List[Any]:
    """
    Normalize conversation history before sending it to prompts.py.

    No semantic processing happens here.

    The history is simply passed through in a safe list form.
    """

    if not conversation_history:
        return []

    try:
        return list(conversation_history)
    except TypeError:
        return []


def _build_prompts(
    prepared_query: str,
    result: RetrievalResult,
    conversation_history: Optional[Sequence[Any]],
    prompt_builder: PromptBuilder,
) -> Tuple[str, str]:
    """
    Build the system and user prompts.

    `prepared_query` MUST be the output of query_understanding.py.

    Generation does not rewrite it.
    """

    system_prompt = prompt_builder.build_system_prompt()

    history = _prepare_history(conversation_history)

    user_prompt = build_user_prompt(
        query=prepared_query,
        result=result,
        conversation_history=history,
    )

    return system_prompt, user_prompt


# ---------------------------------------------------------------------------
# Groq call
# ---------------------------------------------------------------------------

def _call_llm(
    system_prompt: str,
    user_prompt: str,
    config: GenerationConfig,
) -> str:
    """
    Call the Groq generation model.

    Retries transient rate-limit and connection failures.
    """

    client = _get_client(config)

    last_error: Optional[Exception] = None

    attempts = max(1, config.max_retries)

    for attempt in range(1, attempts + 1):

        try:
            response = client.chat.completions.create(
                model=config.model,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
            )

            if not response.choices:
                raise GenerationError(
                    "The language model returned no choices."
                )

            message = response.choices[0].message

            content = getattr(message, "content", None)

            if not content:
                raise GenerationError(
                    "The language model returned an empty response."
                )

            return str(content).strip()

        except RateLimitError as exc:
            last_error = exc

            logger.warning(
                "Groq rate limit encountered "
                "(attempt %d/%d).",
                attempt,
                attempts,
            )

            if attempt < attempts:
                time.sleep(min(2 ** (attempt - 1), 4))

        except APIConnectionError as exc:
            last_error = exc

            logger.warning(
                "Groq connection error "
                "(attempt %d/%d).",
                attempt,
                attempts,
            )

            if attempt < attempts:
                time.sleep(min(2 ** (attempt - 1), 4))

        except APIError as exc:
            logger.error(
                "Groq API error during generation: %s",
                exc,
            )
            raise GenerationError(
                "The language model could not generate a response."
            ) from exc

        except GenerationError:
            raise

        except Exception as exc:
            logger.exception(
                "Unexpected error during LLM generation."
            )
            raise GenerationError(
                "An unexpected error occurred while generating the response."
            ) from exc

    raise GenerationError(
        "The language model could not be reached after retries."
    ) from last_error


# ---------------------------------------------------------------------------
# Lightweight technical validation
# ---------------------------------------------------------------------------

def _validate_generated_answer(
    answer: str,
    max_words: int = 450,
) -> str:
    """
    Perform only technical validation.

    This intentionally does NOT attempt to determine whether the answer
    is semantically grounded. That responsibility belongs to the
    generation prompt and the LLM's reasoning over the retrieved evidence.

    We only reject clearly unusable output:

    - empty response
    - excessively large response
    """

    cleaned = answer.strip()

    if not cleaned:
        raise GenerationError(
            "The language model returned an empty answer."
        )

    word_count = len(cleaned.split())

    if word_count > max_words:
        logger.warning(
            "Generated response exceeded %d words; trimming.",
            max_words,
        )

        words = cleaned.split()
        cleaned = " ".join(words[:max_words]).strip()

        # Avoid ending abruptly where possible.
        if cleaned and cleaned[-1] not in ".!?":
            cleaned += "."

    return cleaned


# ---------------------------------------------------------------------------
# Fallback
# ---------------------------------------------------------------------------

def _fallback_answer() -> str:
    """
    Minimal technical fallback.

    This is used only when the generation process itself fails.

    It does not attempt to answer the user's question.
    """

    return (
        "I’m sorry, I couldn’t generate a reliable response right now. "
        "Please try your question again."
    )


# ---------------------------------------------------------------------------
# Source extraction
# ---------------------------------------------------------------------------

def _extract_sources(
    chunks: Sequence[RetrievedChunk],
) -> List[str]:
    """
    Extract useful source labels from retrieved chunks.

    The exact metadata structure can vary between retrieval versions,
    so this function is intentionally defensive.
    """

    sources: List[str] = []
    seen = set()

    for chunk in chunks:
        metadata: Dict[str, Any] = getattr(
            chunk,
            "metadata",
            {},
        ) or {}

        source = (
            metadata.get("source_id")
            or metadata.get("source")
            or metadata.get("title")
            or metadata.get("file")
        )

        if source is None:
            continue

        source_text = str(source).strip()

        if not source_text:
            continue

        if source_text not in seen:
            seen.add(source_text)
            sources.append(source_text)

    return sources


# ---------------------------------------------------------------------------
# Main generation function
# ---------------------------------------------------------------------------

def generate_answer(
    query: str,
    result: RetrievalResult,
    config: Optional[GenerationConfig] = None,
    conversation_history: Optional[Sequence[Any]] = None,
    prompt_builder: Optional[PromptBuilder] = None,
) -> GenerationResult:
    """
    Generate the final answer from the prepared query and retrieved evidence.

    IMPORTANT
    ---------
    `query` MUST be the output of query_understanding.py.

    It must NOT be the raw user message.

    Expected flow:

        raw user message
                |
                v
        query_understanding.py
                |
                v
        generate_answer(query=prepared_query, ...)
                |
                v
        prompts.py
                |
                v
             Groq LLM

    The LLM receives:

    1. the prepared query
    2. retrieved evidence
    3. relevant conversation history

    The LLM then decides how to formulate the final response based on
    the available evidence and the instructions in prompts.py.

    Generation does NOT:

    - rewrite the query
    - classify chitchat
    - choose a generation mode
    - apply a confidence threshold
    - perform hard OOD branching
    - run keyword-overlap grounding checks
    - answer through Python
    """

    if config is None:
        config = GenerationConfig.from_environment()

    if prompt_builder is None:
        prompt_builder = PromptBuilder()

    # ---------------------------------------------------------------
    # The input here is deliberately the Query Understanding output.
    # ---------------------------------------------------------------

    if not isinstance(query, str):
        raise GenerationError(
            "Generation expected the prepared query as a string."
        )

    prepared_query = query.strip()

    if not prepared_query:
        logger.error(
            "Generation received an empty prepared query."
        )

        return GenerationResult(
            answer=_fallback_answer(),
            confidence=getattr(result, "confidence", 0.0),
            is_out_of_domain=getattr(
                result,
                "is_out_of_domain",
                False,
            ),
            sources=_extract_sources(
                getattr(result, "chunks", []) or []
            ),
            used_fallback=True,
            retrieved_chunks=len(
                getattr(result, "chunks", []) or []
            ),
        )

    chunks = getattr(result, "chunks", []) or []

    confidence = float(
        getattr(result, "confidence", 0.0) or 0.0
    )

    is_out_of_domain = bool(
        getattr(result, "is_out_of_domain", False)
    )

    logger.info(
        "Generation started: prepared_query=%r "
        "chunks=%d confidence=%.3f out_of_domain=%s",
        prepared_query,
        len(chunks),
        confidence,
        is_out_of_domain,
    )

    # ---------------------------------------------------------------
    # Build prompts.
    #
    # No mode is selected here.
    # No semantic decision is made here.
    # ---------------------------------------------------------------

    try:
        system_prompt, user_prompt = _build_prompts(
            prepared_query=prepared_query,
            result=result,
            conversation_history=conversation_history,
            prompt_builder=prompt_builder,
        )

    except Exception as exc:
        logger.exception(
            "Failed to build generation prompts."
        )

        return GenerationResult(
            answer=_fallback_answer(),
            confidence=confidence,
            is_out_of_domain=is_out_of_domain,
            sources=_extract_sources(chunks),
            used_fallback=True,
            retrieved_chunks=len(chunks),
        )

    # ---------------------------------------------------------------
    # Generate final response.
    # ---------------------------------------------------------------

    try:
        raw_answer = _call_llm(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            config=config,
        )

        answer = _validate_generated_answer(raw_answer)

    except GenerationError as exc:
        logger.error(
            "Answer generation failed: %s",
            exc,
        )

        return GenerationResult(
            answer=_fallback_answer(),
            confidence=confidence,
            is_out_of_domain=is_out_of_domain,
            sources=_extract_sources(chunks),
            used_fallback=True,
            retrieved_chunks=len(chunks),
        )

    # ---------------------------------------------------------------
    # Successful result.
    # ---------------------------------------------------------------

    sources = _extract_sources(chunks)

    logger.info(
        "Generation completed successfully: "
        "answer_words=%d sources=%d",
        len(answer.split()),
        len(sources),
    )

    return GenerationResult(
        answer=answer,
        confidence=confidence,
        is_out_of_domain=is_out_of_domain,
        sources=sources,
        used_fallback=False,
        retrieved_chunks=len(chunks),
    )


# ---------------------------------------------------------------------------
# Optional convenience wrapper
# ---------------------------------------------------------------------------

def generate(
    prepared_query: str,
    result: RetrievalResult,
    conversation_history: Optional[Sequence[Any]] = None,
    config: Optional[GenerationConfig] = None,
) -> str:
    """
    Small convenience wrapper for callers that only need the answer.

    `prepared_query` must come from query_understanding.py.
    """

    generation_result = generate_answer(
        query=prepared_query,
        result=result,
        config=config,
        conversation_history=conversation_history,
    )

    return generation_result.answer


# ---------------------------------------------------------------------------
# Module-level default configuration
# ---------------------------------------------------------------------------

_default_config: Optional[GenerationConfig] = None


def get_generation_config() -> GenerationConfig:
    """
    Return a cached default GenerationConfig.

    Useful when multiple requests share the same application process.
    """

    global _default_config

    if _default_config is None:
        _default_config = GenerationConfig.from_environment()

    return _default_config
