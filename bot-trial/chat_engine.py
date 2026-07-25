"""
chat_engine.py
The single orchestration layer for the SBBWU chatbot — combines retrieval,
generation, conversation memory, guardrails, small-talk handling, and a
lightweight answer cache into one entry point: ChatEngine.handle_message().

Why this file exists: without it, a FastAPI/Flask layer would end up
reimplementing conversation memory and guardrails itself, mixed in with
HTTP routing code. Instead, the API layer becomes a thin wrapper — it just
calls handle_message() and returns the result as JSON.
"""

from __future__ import annotations

import re
import json
import time
import sqlite3
import logging
from dataclasses import dataclass, field
from typing import List, Dict, Optional

from retrieval import RetrievalEngine, RetrievalError
from generation import GenerationConfig, generate_answer, rewrite_query
from prompts import PromptBuilder

logging.basicConfig(
    level="INFO",
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("chat_engine")


# =============================================================================
# GUARDRAILS & SMALL TALK
# =============================================================================

MAX_MESSAGE_WORDS = 300

_GREETING_RE = re.compile(r"^\s*(hi|hello|hey|salam|assalam[\w\s]*|good (morning|afternoon|evening))\W*$", re.I)
_THANKS_RE = re.compile(r"^\s*(thanks|thank you|thx|shukriya)\W*$", re.I)
_FAREWELL_RE = re.compile(r"^\s*(bye|goodbye|see you|khuda hafiz)\W*$", re.I)
_IDENTITY_RE = re.compile(r"\b(who are you|what are you|are you (a )?(bot|ai|human))\b", re.I)

_FOLLOWUP_HINT_WORDS = {"it", "its", "it's", "he", "she", "they", "his", "her", "their", "them", "that", "this", "one"}

_SMALL_TALK_REPLIES = {
    "greeting": "Hello! I'm SBBWU's helpdesk assistant. Ask me about admissions, departments, faculty, or any university-related question.",
    "thanks": "You're welcome! Let me know if you have any other questions about SBBWU.",
    "farewell": "Goodbye! Feel free to come back anytime you have a question about SBBWU.",
    "identity": "I'm the official AI helpdesk assistant for Shaheed Benazir Bhutto Women University (SBBWU), here to help with admissions, departments, and general university information.",
}


def classify_small_talk(message: str) -> Optional[str]:
    """Cheap, dependency-free intent check that runs BEFORE the RAG
    pipeline. Greetings/thanks/farewells never need retrieval or an LLM
    call, and routing them here avoids an awkward out-of-domain fallback
    for something as simple as "hi"."""
    m = message.strip()
    if _GREETING_RE.match(m):
        return "greeting"
    if _THANKS_RE.match(m):
        return "thanks"
    if _FAREWELL_RE.match(m):
        return "farewell"
    if _IDENTITY_RE.search(m):
        return "identity"
    return None


def looks_like_followup(message: str) -> bool:
    """Heuristic: short messages containing a pronoun with no clear subject
    are likely relying on prior conversation context (e.g. "what's their
    email?"). Cheap enough to run on every message before deciding whether
    the more expensive LLM-based rewrite is worth calling."""
    words = message.lower().split()
    if not words:
        return False
    return len(words) <= 8 and bool(_FOLLOWUP_HINT_WORDS & set(words))


# =============================================================================
# CONVERSATION STORE (SQLite — doubles as the foundation for chat history
# and the admin dashboard planned later)
# =============================================================================

class ConversationStore:
    def __init__(self, db_path: str = "chat_history.db"):
        self.db_path = db_path
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    confidence REAL,
                    used_fallback INTEGER,
                    sources TEXT,
                    feedback INTEGER,
                    created_at REAL NOT NULL
                )
            """)
            conn.commit()

    def add_message(
        self, session_id: str, role: str, content: str,
        confidence: Optional[float] = None, used_fallback: Optional[bool] = None,
        sources: Optional[List[str]] = None,
    ) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO messages (session_id, role, content, confidence, used_fallback, sources, feedback, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, NULL, ?)",
                (
                    session_id, role, content, confidence,
                    int(bool(used_fallback)) if used_fallback is not None else None,
                    json.dumps(sources or []), time.time(),
                ),
            )
            conn.commit()
            return cursor.lastrowid

    def get_history(self, session_id: str, limit: int = 6) -> List[Dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
                (session_id, limit),
            ).fetchall()
        return [{"role": r, "content": c} for r, c in reversed(rows)]

    def set_feedback(self, message_id: int, positive: bool) -> None:
        with self._connect() as conn:
            conn.execute("UPDATE messages SET feedback = ? WHERE id = ?", (int(positive), message_id))
            conn.commit()


# =============================================================================
# CHAT ENGINE
# =============================================================================

@dataclass
class ChatResponse:
    message_id: Optional[int]
    answer: str
    sources: List[str] = field(default_factory=list)
    confidence: float = 0.0
    used_fallback: bool = False
    intent: str = "rag"  # "small_talk" | "rag" | "rejected"


class ChatEngine:
    """The single entry point a future API layer should call. Owns the
    (expensive, load-once) retrieval engine, conversation memory, and a
    lightweight repeat-query cache."""

    def __init__(
        self,
        retrieval_engine: Optional[RetrievalEngine] = None,
        generation_config: Optional[GenerationConfig] = None,
        prompt_builder: Optional[PromptBuilder] = None,
        store: Optional[ConversationStore] = None,
        cache_size: int = 256,
    ):
        self.retrieval_engine = retrieval_engine or RetrievalEngine()
        self.generation_config = generation_config or GenerationConfig()
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.store = store or ConversationStore()
        self._answer_cache: Dict[str, ChatResponse] = {}
        self._cache_size = cache_size

    def _cache_get(self, key: str) -> Optional[ChatResponse]:
        return self._answer_cache.get(key)

    def _cache_set(self, key: str, value: ChatResponse) -> None:
        if len(self._answer_cache) >= self._cache_size:
            self._answer_cache.pop(next(iter(self._answer_cache)))  # drop oldest
        self._answer_cache[key] = value

    def handle_message(self, session_id: str, message: str) -> ChatResponse:
        message = (message or "").strip()

        # ---- Guardrails ----
        if not message:
            return ChatResponse(message_id=None, answer="Please type a question and I'll be happy to help.", intent="rejected")

        if len(message.split()) > MAX_MESSAGE_WORDS:
            return ChatResponse(
                message_id=None,
                answer=f"That message is quite long — could you shorten it to under {MAX_MESSAGE_WORDS} words?",
                intent="rejected",
            )

        self.store.add_message(session_id, "user", message)

        # ---- Small talk short-circuit (zero retrieval, zero LLM calls) ----
        intent = classify_small_talk(message)
        if intent:
            reply = _SMALL_TALK_REPLIES[intent]
            msg_id = self.store.add_message(session_id, "assistant", reply, confidence=1.0, used_fallback=False)
            return ChatResponse(message_id=msg_id, answer=reply, confidence=1.0, intent="small_talk")

        # ---- Conversation-aware query rewriting for follow-ups ----
        history = self.store.get_history(session_id, limit=6)
        search_query = message
        if history and looks_like_followup(message):
            search_query = rewrite_query(message, history, self.generation_config)
            logger.info("Rewrote follow-up %r -> %r", message, search_query)

        # ---- Repeat-query cache (saves latency + LLM cost on repeats) ----
        cache_key = search_query.lower().strip()
        cached = self._cache_get(cache_key)
        if cached:
            logger.info("Cache hit for query=%r", search_query)
            msg_id = self.store.add_message(
                session_id, "assistant", cached.answer,
                confidence=cached.confidence, used_fallback=cached.used_fallback, sources=cached.sources,
            )
            return ChatResponse(
                message_id=msg_id, answer=cached.answer, sources=cached.sources,
                confidence=cached.confidence, used_fallback=cached.used_fallback, intent="rag",
            )

        # ---- Retrieval ----
        try:
            retrieval_result = self.retrieval_engine.retrieve(search_query)
        except RetrievalError:
            logger.exception("Retrieval failed for query=%r", search_query)
            reply = "I'm having trouble searching the knowledge base right now. Please try again shortly."
            msg_id = self.store.add_message(session_id, "assistant", reply, used_fallback=True)
            return ChatResponse(message_id=msg_id, answer=reply, used_fallback=True, intent="rejected")

        # ---- Generation ----
        gen_result = generate_answer(
            message, retrieval_result, self.generation_config,
            conversation_history=history, prompt_builder=self.prompt_builder,
        )

        response = ChatResponse(
            message_id=None,
            answer=gen_result.answer,
            sources=gen_result.sources,
            confidence=gen_result.confidence,
            used_fallback=gen_result.used_fallback,
            intent="rag",
        )

        msg_id = self.store.add_message(
            session_id, "assistant", response.answer,
            confidence=response.confidence, used_fallback=response.used_fallback, sources=response.sources,
        )
        response.message_id = msg_id

        if not gen_result.used_fallback:
            self._cache_set(cache_key, response)

        return response

    def record_feedback(self, message_id: int, positive: bool) -> None:
        self.store.set_feedback(message_id, positive)


# =============================================================================
# MANUAL SMOKE TEST
# =============================================================================

if __name__ == "__main__":
    engine = ChatEngine()
    session = "demo-session-1"

    conversation = [
        "hi",
        "Who is the current Vice Chancellor?",
        "What's their email?",  # follow-up — should get rewritten before retrieval
        "thanks",
    ]

    for msg in conversation:
        result = engine.handle_message(session, msg)
        print(f"\nUSER: {msg}")
        print(f"BOT [{result.intent}, confidence={result.confidence}]: {result.answer}")
        if result.sources:
            print(f"Sources: {result.sources}")