
"""
query_understanding.py

Controlled pre-retrieval query understanding for the SBBWU AI Assistant.

RESPONSIBILITY
--------------

This module has ONE job:

    Raw User Message
            ↓
    Query Understanding
            ↓
    ONE safe retrieval query
            ↓
        Retrieval

It does NOT:

- answer the user
- retrieve knowledge
- block questions
- decide whether a question is in-domain
- generate multiple queries
- invent university information
- perform broad semantic expansion
- replace the user's actual question

CORE PRINCIPLE
--------------

Preserve the user's meaning.

Only make small, necessary improvements such as:

- obvious typo correction
- clear abbreviation expansion
- necessary reference/pronoun resolution
- minimal clarification of university context

A standalone question must remain independent from previous conversation.

Conversation history is used ONLY when the current message clearly
depends on a previous turn.
"""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from groq import Groq


# =============================================================================
# ENVIRONMENT
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / "groq.env"

load_dotenv(ENV_FILE)
load_dotenv()


# =============================================================================
# LOGGING
# =============================================================================

logger = logging.getLogger("query_understanding")


# =============================================================================
# CONFIGURATION
# =============================================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Use the SAME Groq model as the Generation stage.
# Query Understanding no longer prefers or uses GROQ_REWRITE_MODEL.
GROQ_MODEL = (
    os.getenv("GROQ_MODEL")
    or "openai/gpt-oss-120b"
).strip()

TEMPERATURE = float(
    os.getenv("LLM_TEMPERATURE", "0.2")
)

MAX_TOKENS = int(
    os.getenv("LLM_MAX_TOKENS", "300")
)

TIMEOUT = float(
    os.getenv("LLM_TIMEOUT", "20")
)

MAX_RETRIES = int(
    os.getenv("LLM_MAX_RETRIES", "3")
)


# =============================================================================
# VALID INTENTS
# =============================================================================

#
# Kept only for compatibility with the existing ChatEngine.
#
# IMPORTANT:
# Intent is metadata only.
# It does NOT control retrieval or generation.

INTENTS = {
    "admission",
    "program_info",
    "faculty_person",
    "fee",
    "contact",
    "facility",
    "deadline",
    "eligibility",
    "general_chat",
    "out_of_domain",
}


# =============================================================================
# RESULT
# =============================================================================

@dataclass
class QueryUnderstanding:
    """
    Result of the query-understanding stage.

    intent:
        Coarse metadata only.
        It must never block or route the request.

    query:
        The ONE retrieval query produced from the user's message.
    """

    intent: str
    query: str


# =============================================================================
# FOLLOW-UP DETECTION
# =============================================================================

"""
History should NOT be used just because a message contains a word such as
"this" or "that".

For example:

    "What is this program?"

may require context.

But:

    "What is this admission process?"

may be a standalone question.

Therefore the heuristic below focuses mainly on:

- pronouns referring to people/things
- explicit "what about..." continuation
- short elliptical follow-ups

This heuristic does NOT resolve the reference.

It only decides whether history is allowed to be shown to the LLM.
"""

_FOLLOWUP_PATTERNS = (
    # -------------------------------------------------------------------------
    # Person/object pronouns
    # -------------------------------------------------------------------------

    r"\b(her|his|their|its|them|he|she)\b",

    # -------------------------------------------------------------------------
    # Explicit continuation phrases
    # -------------------------------------------------------------------------

    r"^\s*(what about|how about)\b",
    r"^\s*(and what about|and how about)\b",

    # -------------------------------------------------------------------------
    # Explicit references to something previously discussed
    # -------------------------------------------------------------------------

    r"\b(that person)\b",
    r"\b(that department)\b",
    r"\b(that program)\b",
    r"\b(that office)\b",
    r"\b(that faculty member)\b",

    # -------------------------------------------------------------------------
    # Common elliptical follow-ups
    # -------------------------------------------------------------------------

    r"^\s*(what is her)\b",
    r"^\s*(what is his)\b",
    r"^\s*(what is their)\b",
    r"^\s*(what is its)\b",

    r"^\s*(what are her)\b",
    r"^\s*(what are his)\b",
    r"^\s*(what are their)\b",
    r"^\s*(what are its)\b",

    r"^\s*(where is she)\b",
    r"^\s*(where is he)\b",
    r"^\s*(where is it)\b",

    r"^\s*(who is she)\b",
    r"^\s*(who is he)\b",

    # -------------------------------------------------------------------------
    # Very short continuation forms
    # -------------------------------------------------------------------------

    r"^\s*(and her)\b",
    r"^\s*(and his)\b",
    r"^\s*(and their)\b",
    r"^\s*(and its)\b",
)

_FOLLOWUP_REGEXES = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in _FOLLOWUP_PATTERNS
]


def _needs_history(query: str) -> bool:
    """
    Decide whether previous conversation may be relevant.

    This function does NOT determine what the previous reference means.

    It only answers:

        "Should the LLM be allowed to see previous conversation?"

    Standalone questions return False.
    """

    query = query.strip()

    if not query:
        return False

    for pattern in _FOLLOWUP_REGEXES:
        if pattern.search(query):
            return True

    return False


# =============================================================================
# HISTORY
# =============================================================================

def _build_history(
    conversation_history: Optional[List[dict]],
) -> str:
    """
    Build a small previous-conversation context.

    Only the most recent four valid USER/ASSISTANT messages are included.

This function does not decide relevance.

The system prompt tells the LLM to use this history only when it is
actually required to resolve the current message.
    """

    if not conversation_history:
        return ""

    recent = conversation_history[-4:]

    lines: List[str] = []

    for item in recent:
        if not isinstance(item, dict):
            continue

        role = str(
            item.get("role", "")
        ).strip().upper()

        content = str(
            item.get("content", "")
        ).strip()

        if role not in {"USER", "ASSISTANT"}:
            continue

        if not content:
            continue

        lines.append(
            f"{role}: {content}"
        )

    if not lines:
        return ""

    return (
        "PREVIOUS CONVERSATION:\n"
        + "\n".join(lines)
        + "\n\n"
    )


# =============================================================================
# SYSTEM PROMPT
# =============================================================================

SYSTEM_PROMPT = """
You are the Query Understanding component of the
Shaheed Benazir Bhutto Women University (SBBWU) AI Assistant.

Your ONLY task is to convert the CURRENT USER MESSAGE into ONE clean
retrieval query.

You are NOT the answer generator.

Do not answer the user.
Do not explain your reasoning.
Do not ask questions.
Do not generate multiple queries.
Do not generate search alternatives.
Do not decide whether the user should be blocked.
Do not invent university facts.

============================================================
CORE RULE
============================================================

PRESERVE THE USER'S ORIGINAL MEANING.

The output query must represent the SAME request as the user's message.

Make the smallest useful change needed for retrieval.

Think:

    CLEAN THE USER'S QUESTION

NOT:

    CREATE A BETTER OR BIGGER QUESTION

If the original message is already clear, keep it very close to the
original wording.

============================================================
1. TYPO CORRECTION
============================================================

Correct obvious spelling and typing mistakes.

Examples:

"admssion" -> "admission"

"departmant" -> "department"

"progams" -> "programs"

"conatct" -> "contact"

"currnt" -> "current"

Do not change the meaning while correcting spelling.

============================================================
2. CLEAR ABBREVIATIONS
============================================================

Expand an abbreviation ONLY when its meaning is clear in the SBBWU
university context.

Examples:

CS -> Computer Science

VC -> Vice Chancellor

HOD -> Head of Department

BS -> Bachelor of Science

MPhil -> Master of Philosophy

BBA -> Bachelor of Business Administration

QEC -> Quality Enhancement Cell

ORIC -> Office of Research, Innovation and Commercialization

Do not invent an expansion for an ambiguous abbreviation.

Do not expand every short word unnecessarily.

============================================================
3. CONVERSATION HISTORY
============================================================

Previous conversation is provided only when the current message appears
to depend on it.

Use previous conversation ONLY to resolve a genuine reference.

Example:

PREVIOUS:

USER: Who is the current VC?

ASSISTANT: Prof. Dr. Farhat Amin is the current Vice Chancellor.

CURRENT:

"What's her email?"

OUTPUT:

"What is the email address of Vice Chancellor Prof. Dr. Farhat Amin at SBBWU?"

The name comes from the previous conversation because "her" needs a
reference.

------------------------------------------------------------

Another example:

PREVIOUS:

USER: Tell me about Computer Science.

ASSISTANT: ...

CURRENT:

"What programs does it offer?"

OUTPUT:

"What programs does the Computer Science Department at SBBWU offer?"

------------------------------------------------------------

IMPORTANT:

Do NOT use previous conversation for an independent question.

PREVIOUS:

USER: Who is the current VC?

ASSISTANT: Prof. Dr. Farhat Amin.

CURRENT:

"How many departments does SBBWU have?"

OUTPUT:

"How many departments does SBBWU have?"

Do not mention the Vice Chancellor in the output.

============================================================
4. DO NOT OVER-REWRITE
============================================================

Do not add concepts that the user did not request.

User:

"tell me about cs"

Good:

"Tell me about Computer Science at SBBWU."

Bad:

"What undergraduate and postgraduate Computer Science programs,
courses, degrees, faculty, curriculum, admissions, and career
opportunities are available at SBBWU?"

The bad version changes and expands the user's request.

Keep the rewrite concise.

============================================================
5. BROAD QUESTIONS
============================================================

Broad does NOT mean incomplete.

If the user asks:

"What programs are available?"

Do not automatically add:

- undergraduate
- postgraduate
- degrees
- courses
- departments
- admissions
- eligibility

A reasonable output is:

"What programs are available at SBBWU?"

Do not invent a narrower interpretation.

============================================================
6. SYNONYMS
============================================================

Do NOT create synonym lists.

Only use a different word when it is necessary to correct the user's
meaning or improve basic retrieval clarity.

Do not transform:

"admission deadline"

into:

"admission deadline closing date last date application submission date"

Keep it simple.

============================================================
7. UNIVERSITY CONTEXT
============================================================

Add "SBBWU" or "Shaheed Benazir Bhutto Women University" only when it
helps make the retrieval query clearly university-specific.

For example:

"admission process"

may become:

"SBBWU admission process"

But if the user already says:

"What is the admission process at SBBWU?"

do not unnecessarily repeat the university name.

============================================================
8. NEVER INVENT FACTS
============================================================

Never invent or assume:

- names
- dates
- fees
- deadlines
- emails
- phone numbers
- departments
- programs
- eligibility requirements
- locations
- policies

Query Understanding is NOT a knowledge source.

You may use:

1. information explicitly present in the current user message

2. information clearly established in previous conversation when needed
   to resolve a reference

============================================================
9. OUT-OF-DOMAIN QUESTIONS
============================================================

Do not answer or block an out-of-domain question.

Simply preserve its meaning in the query field.

The downstream system decides how to handle retrieval and the final answer.

============================================================
10. INTENT
============================================================

Return exactly one coarse intent:

admission

program_info

faculty_person

fee

contact

facility

deadline

eligibility

general_chat

out_of_domain

Intent is metadata only.

It must NEVER change the query.

It must NEVER block retrieval.

If uncertain, use:

"general_chat"

============================================================
11. ONE QUERY
============================================================

Return exactly ONE retrieval query.

Never return:

- multiple queries
- alternatives
- bullet points
- explanations
- reasoning
- search suggestions

============================================================
12. OUTPUT FORMAT
============================================================

Return exactly one JSON object:

{
  "intent": "program_info",
  "query": "What programs are available at SBBWU?"
}

No markdown.

No code fences.

No additional text.
"""


# =============================================================================
# JSON EXTRACTION
# =============================================================================

_JSON_OBJECT_RE = re.compile(
    r"\{.*\}",
    re.DOTALL,
)


def _extract_json(raw: str) -> dict:
    """
    Extract one JSON object from the model response.

    Handles accidental markdown fences or surrounding text.
    """

    if not raw:
        raise ValueError(
            "Empty LLM response"
        )

    cleaned = raw.strip()

    # Remove opening markdown fence.
    cleaned = re.sub(
        r"^\s*```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    # Remove closing markdown fence.
    cleaned = re.sub(
        r"\s*```\s*$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    ).strip()

    match = _JSON_OBJECT_RE.search(cleaned)

    if not match:
        raise ValueError(
            f"No JSON object found in LLM output: {raw!r}"
        )

    return json.loads(
        match.group(0)
    )


# =============================================================================
# GROQ CLIENT
# =============================================================================

_client: Optional[Groq] = None


def _get_client() -> Groq:
    """
    Return one reusable Groq client.
    """

    global _client

    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. "
                f"Expected it in: {ENV_FILE}"
            )

        _client = Groq(
            api_key=GROQ_API_KEY,
            timeout=TIMEOUT,
            max_retries=MAX_RETRIES,
        )

    return _client


# =============================================================================
# QUERY CLEANING
# =============================================================================

def _clean_query(query: str) -> str:
    """
    Perform only safe formatting cleanup.

    This function does NOT change semantic meaning.
    """

    query = query.strip()

    # Collapse repeated whitespace.
    query = re.sub(
        r"\s+",
        " ",
        query,
    )

    # Remove accidental surrounding quotes.
    query = query.strip("\"'")

    return query.strip()


# =============================================================================
# QUERY VALIDATION
# =============================================================================

def _validate_query(
    original_query: str,
    rewritten_query: str,
) -> str:
    """
    Validate the LLM-generated retrieval query.

    If the result is clearly unusable, return the original query unchanged.
    """

    original_query = original_query.strip()

    rewritten_query = _clean_query(
        rewritten_query
    )

    if not rewritten_query:
        return original_query

    # Prevent extremely long rewrites.
    if len(rewritten_query.split()) > 80:
        logger.warning(
            "Rewritten query is too long; using original query."
        )
        return original_query

    # Prevent a response that is effectively an explanation.
    suspicious_prefixes = (
        "here is",
        "here's",
        "the query is",
        "the rewritten query is",
        "i would search",
        "search for",
    )

    lowered = rewritten_query.lower()

    if lowered.startswith(
        suspicious_prefixes
    ):
        logger.warning(
            "Rewritten query appears to contain explanation; "
            "using original query."
        )
        return original_query

    return rewritten_query


# =============================================================================
# MAIN FUNCTION
# =============================================================================

def understand_query(
    raw_query: str,
    conversation_history: Optional[List[dict]] = None,
    model: Optional[str] = None,
) -> QueryUnderstanding:
    """
    Convert the raw user message into ONE retrieval query.

    History is allowed only when the current message clearly contains
    a follow-up/reference pattern.

    On any failure, the original query is returned unchanged.

    The default model is the SAME GROQ_MODEL used by Generation.
    """

    # =========================================================================
    # 1. EMPTY QUERY
    # =========================================================================

    if not raw_query or not raw_query.strip():
        return QueryUnderstanding(
            intent="general_chat",
            query=raw_query or "",
        )

    raw_query = raw_query.strip()

    # =========================================================================
    # 2. SELECT MODEL
    # =========================================================================

    # By default, use the same model configured for Generation.
    # The optional `model` argument remains available for testing.
    selected_model = (
        model.strip()
        if model
        else GROQ_MODEL
    )

    # =========================================================================
    # 3. DETERMINE WHETHER HISTORY MAY BE USED
    # =========================================================================

    use_history = _needs_history(
        raw_query
    )

    history_block = ""

    if use_history:
        history_block = _build_history(
            conversation_history
        )

    # If no usable history exists, there is nothing to send.
    history_used = bool(
        history_block
    )

    logger.info(
        "history=%s | raw=%r",
        "USED" if history_used else "NOT USED",
        raw_query,
    )

    # =========================================================================
    # 4. BUILD USER PROMPT
    # =========================================================================

    user_prompt = (
        history_block
        + "CURRENT USER MESSAGE:\n"
        + raw_query
    )

    # =========================================================================
    # 5. CALL GROQ
    # =========================================================================

    try:
        client = _get_client()

        response = client.chat.completions.create(
            model=selected_model,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        )

        # =====================================================================
        # 6. READ MODEL RESPONSE
        # =====================================================================

        content = (
            response.choices[0]
            .message
            .content
            or ""
        ).strip()

        if not content:
            raise ValueError(
                "LLM returned an empty response."
            )

        # =====================================================================
        # 7. PARSE JSON
        # =====================================================================

        data = _extract_json(
            content
        )

        if not isinstance(data, dict):
            raise ValueError(
                "LLM response is not a JSON object."
            )

        # =====================================================================
        # 8. READ QUERY
        # =====================================================================

        rewritten_query = str(
            data.get("query", "")
        ).strip()

        if not rewritten_query:
            raise ValueError(
                "LLM returned an empty query."
            )

        rewritten_query = _validate_query(
            raw_query,
            rewritten_query,
        )

        # =====================================================================
        # 9. READ INTENT
        # =====================================================================

        #
        # Kept only because the current ChatEngine expects QueryUnderstanding
        # to contain intent.
        #
        # It has NO routing authority.

        intent = str(
            data.get(
                "intent",
                "general_chat",
            )
        ).strip().lower()

        if intent not in INTENTS:
            logger.warning(
                "Unknown intent '%s'; using general_chat.",
                intent,
            )
            intent = "general_chat"

        # =====================================================================
        # 10. SUCCESS
        # =====================================================================

        logger.info(
            "query_understanding_success | "
            "raw=%r | history=%s | intent=%s | query=%r",
            raw_query,
            "used" if history_used else "ignored",
            intent,
            rewritten_query,
        )

        return QueryUnderstanding(
            intent=intent,
            query=rewritten_query,
        )

    # =========================================================================
    # 11. SAFE FALLBACK
    # =========================================================================

    except Exception as exc:
        logger.warning(
            "Query understanding failed using model '%s': %s. "
            "Using original query unchanged.",
            selected_model,
            exc,
        )

        return QueryUnderstanding(
            intent="general_chat",
            query=raw_query,
        )


# =============================================================================
# MANUAL SMOKE TEST
# =============================================================================

if __name__ == "__main__":

    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s | %(name)s | %(message)s",
    )

    print("\n" + "=" * 70)
    print("SBBWU QUERY UNDERSTANDING TEST")
    print("=" * 70)

    print(f"\nEnvironment: {ENV_FILE}")

    print(
        f"Environment exists: {ENV_FILE.exists()}"
    )

    print(
        f"Model: {GROQ_MODEL}"
    )

    print(
        f"Temperature: {TEMPERATURE}"
    )

    print(
        f"Max tokens: {MAX_TOKENS}"
    )

    print(
        f"API key loaded: "
        f"{'YES' if GROQ_API_KEY else 'NO'}"
    )

    # -------------------------------------------------------------------------
    # Previous conversation
    # -------------------------------------------------------------------------

    history = [
        {
            "role": "user",
            "content": "Who is the current VC?",
        },
        {
            "role": "assistant",
            "content": (
                "Prof. Dr. Farhat Amin is the current "
                "Vice Chancellor."
            ),
        },
    ]

    tests = [

        # =====================================================================
        # 1. Standalone question
        # History must NOT influence it.
        # =====================================================================

        (
            "How many departments are there in the university?",
            history,
        ),

        # =====================================================================
        # 2. Abbreviation
        # =====================================================================

        (
            "tell me about cs",
            None,
        ),

        # =====================================================================
        # 3. Typo correction
        # =====================================================================

        (
            "when the admssion for bs is ging to be started",
            None,
        ),

        # =====================================================================
        # 4. Contact + typos
        # =====================================================================

        (
            "ok so what is the admsion office conatct",
            None,
        ),

        # =====================================================================
        # 5. Broad query
        # =====================================================================

        (
            "what programs are available?",
            None,
        ),

        # =====================================================================
        # 6. Genuine follow-up
        # =====================================================================

        (
            "whats her email",
            history,
        ),
    ]

    for raw_query, history_data in tests:

        result = understand_query(
            raw_query=raw_query,
            conversation_history=history_data,
        )

        print("\n" + "-" * 70)

        print(
            f"RAW:     {raw_query}"
        )

        print(
            f"INTENT:  {result.intent}"
        )

        print(
            f"QUERY:   {result.query}"
        )

    print("\n" + "=" * 70)
