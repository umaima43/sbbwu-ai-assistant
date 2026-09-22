from __future__ import annotations

import json
import logging
import sqlite3
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from chat_generation.generation import GenerationConfig, generate_answer
from chat_generation.prompts import PromptBuilder
from chat_generation.query_understanding import understand_query
from chat_generation.retrieval import RetrievalEngine, RetrievalError


# =============================================================================
# PATHS
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

CHAT_HISTORY_DB = (
    BASE_DIR / "databases" / "chat_history.db"
)


# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(
    level="INFO",
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("chat_engine")


# =============================================================================
# INPUT GUARDRAILS
# =============================================================================

MAX_MESSAGE_WORDS = 300


# =============================================================================
# CONVERSATION STORE
# =============================================================================

class ConversationStore:
    """
    SQLite-backed conversation history.

    The store is responsible only for persistence.

    It does not decide:
    - how history should influence a query
    - whether a message is small talk
    - whether a query is in-domain
    - how retrieval works
    - how an answer should be generated
    """

    def __init__(
        self,
        db_path: str | Path = CHAT_HISTORY_DB,
    ):
        self.db_path = str(db_path)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
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
                """
            )

            conn.commit()

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        confidence: Optional[float] = None,
        used_fallback: Optional[bool] = None,
        sources: Optional[List[str]] = None,
    ) -> int:

        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO messages (
                    session_id,
                    role,
                    content,
                    confidence,
                    used_fallback,
                    sources,
                    feedback,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
                """,
                (
                    session_id,
                    role,
                    content,
                    confidence,
                    (
                        int(bool(used_fallback))
                        if used_fallback is not None
                        else None
                    ),
                    json.dumps(sources or []),
                    time.time(),
                ),
            )

            conn.commit()

            return cursor.lastrowid

    def get_history(
        self,
        session_id: str,
        limit: int = 6,
    ) -> List[Dict]:
        """
        Return previous conversation turns.

        Results are returned oldest → newest.

        The current user message is not included because ChatEngine
        retrieves history before storing the current message.
        """

        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT role, content
                FROM messages
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (
                    session_id,
                    limit,
                ),
            ).fetchall()

        return [
            {
                "role": role,
                "content": content,
            }
            for role, content in reversed(rows)
        ]

    def set_feedback(
        self,
        message_id: int,
        positive: bool,
    ) -> None:

        with self._connect() as conn:
            conn.execute(
                """
                UPDATE messages
                SET feedback = ?
                WHERE id = ?
                """,
                (
                    int(positive),
                    message_id,
                ),
            )

            conn.commit()


# =============================================================================
# RESPONSE MODEL
# =============================================================================

@dataclass
class ChatResponse:
    """
    Final response returned by ChatEngine.

    `intent` is retained only for API compatibility and observability.

    It does NOT control the pipeline.

    The current architecture always follows:

        Query Understanding
            ↓
        Retrieval
            ↓
        Generation
    """

    message_id: Optional[int]

    answer: str

    sources: List[str] = field(
        default_factory=list
    )

    confidence: float = 0.0

    used_fallback: bool = False

    # Compatibility / descriptive metadata only.
    intent: str = "rag"


# =============================================================================
# CHAT ENGINE
# =============================================================================

class ChatEngine:
    """
    Main orchestration layer.

    ChatEngine coordinates:

        Query Understanding
                ↓
            Retrieval
                ↓
            Generation

    It does not perform semantic routing, query rewriting, small-talk
    classification, or answer generation itself.
    """

    def __init__(
        self,
        retrieval_engine: Optional[RetrievalEngine] = None,
        generation_config: Optional[GenerationConfig] = None,
        prompt_builder: Optional[PromptBuilder] = None,
        store: Optional[ConversationStore] = None,
        cache_size: int = 256,
    ):

        # ------------------------------------------------------------------
        # Retrieval
        # ------------------------------------------------------------------

        self.retrieval_engine = (
            retrieval_engine
            or RetrievalEngine()
        )

        # ------------------------------------------------------------------
        # Generation configuration
        #
        # Load from groq.env/environment when no explicit configuration
        # is supplied.
        # ------------------------------------------------------------------

        self.generation_config = (
            generation_config
            or GenerationConfig.from_environment()
        )

        # ------------------------------------------------------------------
        # Prompt builder
        # ------------------------------------------------------------------

        self.prompt_builder = (
            prompt_builder
            or PromptBuilder()
        )

        # ------------------------------------------------------------------
        # Conversation persistence
        # ------------------------------------------------------------------

        self.store = (
            store
            or ConversationStore()
        )

        # ------------------------------------------------------------------
        # Lightweight in-memory answer cache
        #
        # Cache keys include session_id so answers from one conversation
        # cannot accidentally leak into another conversation.
        # ------------------------------------------------------------------

        self._answer_cache: Dict[
            Tuple[str, str],
            ChatResponse,
        ] = {}

        self._cache_size = max(
            1,
            cache_size,
        )

    # =========================================================================
    # CACHE
    # =========================================================================

    def _cache_get(
        self,
        key: Tuple[str, str],
    ) -> Optional[ChatResponse]:
        """
        Retrieve a cached answer.

        The cache does not participate in semantic understanding.
        It only avoids repeating an already completed generation call.
        """

        return self._answer_cache.get(key)

    def _cache_set(
        self,
        key: Tuple[str, str],
        value: ChatResponse,
    ) -> None:
        """
        Store a response in the bounded in-memory cache.
        """

        if len(self._answer_cache) >= self._cache_size:

            oldest_key = next(
                iter(self._answer_cache)
            )

            self._answer_cache.pop(
                oldest_key
            )

        self._answer_cache[key] = value

    # =========================================================================
    # MAIN PIPELINE
    # =========================================================================

    def handle_message(
        self,
        session_id: str,
        message: str,
    ) -> ChatResponse:

        # =====================================================================
        # TEMPORARY PERFORMANCE TIMING
        # Smoke-test instrumentation only.
        # Does not affect chatbot logic.
        # =====================================================================

        total_start = time.perf_counter()

        message = (
            message or ""
        ).strip()

        # =====================================================================
        # 1. INPUT VALIDATION
        # =====================================================================

        if not message:
            return ChatResponse(
                message_id=None,
                answer=(
                    "Please type a question and I'll be happy to help."
                ),
                intent="rejected",
            )

        if len(message.split()) > MAX_MESSAGE_WORDS:
            return ChatResponse(
                message_id=None,
                answer=(
                    f"That message is quite long — could you shorten it "
                    f"to under {MAX_MESSAGE_WORDS} words?"
                ),
                intent="rejected",
            )

        # =====================================================================
        # 2. GET PREVIOUS HISTORY
        # =====================================================================

        timing_start = time.perf_counter()

        history = self.store.get_history(
            session_id,
            limit=6,
        )

        history_time = (
            time.perf_counter() - timing_start
        )

        logger.info(
            "[TIMING] History retrieval: %.3f s",
            history_time,
        )

        # =====================================================================
        # 3. SAVE CURRENT USER MESSAGE
        # =====================================================================

        timing_start = time.perf_counter()

        self.store.add_message(
            session_id,
            "user",
            message,
        )

        user_save_time = (
            time.perf_counter() - timing_start
        )

        logger.info(
            "[TIMING] Save user message: %.3f s",
            user_save_time,
        )

        # =====================================================================
        # 4. QUERY UNDERSTANDING
        # =====================================================================

        timing_start = time.perf_counter()

        qu_result = understand_query(
            message,
            history,
        )

        query_understanding_time = (
            time.perf_counter() - timing_start
        )

        logger.info(
            "[TIMING] Query Understanding: %.3f s",
            query_understanding_time,
        )

        prepared_query = (
            qu_result.query.strip()
            if qu_result.query
            else ""
        )

        # Safety fallback:
        #
        # Query Understanding is already designed to return the original
        # message on failure, but this additional check prevents an empty
        # query from reaching Retrieval.

        if not prepared_query:
            prepared_query = message

        logger.info(
            "query_understanding: "
            "session=%s raw=%r intent=%s prepared=%r",
            session_id,
            message,
            qu_result.intent,
            prepared_query,
        )

        # =====================================================================
        # 5. CACHE LOOKUP
        # =====================================================================

        cache_key = (
            session_id,
            prepared_query.lower().strip(),
        )

        timing_start = time.perf_counter()

        cached = self._cache_get(
            cache_key
        )

        cache_lookup_time = (
            time.perf_counter() - timing_start
        )

        logger.info(
            "[TIMING] Cache lookup: %.3f s",
            cache_lookup_time,
        )

        if cached is not None:

            logger.info(
                "cache_hit: session=%s prepared_query=%r",
                session_id,
                prepared_query,
            )

            timing_start = time.perf_counter()

            msg_id = self.store.add_message(
                session_id,
                "assistant",
                cached.answer,
                confidence=cached.confidence,
                used_fallback=cached.used_fallback,
                sources=cached.sources,
            )

            assistant_save_time = (
                time.perf_counter() - timing_start
            )

            total_time = (
                time.perf_counter() - total_start
            )

            logger.info(
                "[TIMING] Save assistant message: %.3f s",
                assistant_save_time,
            )

            logger.info(
                "[TIMING] TOTAL REQUEST (cache hit): %.3f s",
                total_time,
            )

            logger.info(
                "[TIMING] --------------------------------------------------"
            )

            return ChatResponse(
                message_id=msg_id,
                answer=cached.answer,
                sources=list(cached.sources),
                confidence=cached.confidence,
                used_fallback=cached.used_fallback,
                intent="rag",
            )

        # =====================================================================
        # 6. RETRIEVAL
        # =====================================================================

        try:

            timing_start = time.perf_counter()

            retrieval_result = (
                self.retrieval_engine.retrieve(
                    prepared_query
                )
            )

            retrieval_time = (
                time.perf_counter() - timing_start
            )

            logger.info(
                "[TIMING] Retrieval: %.3f s",
                retrieval_time,
            )

        except RetrievalError:

            logger.exception(
                "retrieval_failed: session=%s query=%r",
                session_id,
                prepared_query,
            )

            reply = (
                "I'm having trouble searching the university information "
                "right now. Please try again shortly."
            )

            msg_id = self.store.add_message(
                session_id,
                "assistant",
                reply,
                used_fallback=True,
            )

            return ChatResponse(
                message_id=msg_id,
                answer=reply,
                used_fallback=True,
                intent="retrieval_error",
            )

        # =====================================================================
        # 7. GENERATION
        # =====================================================================

        timing_start = time.perf_counter()

        gen_result = generate_answer(
            prepared_query,
            retrieval_result,
            self.generation_config,
            conversation_history=history,
            prompt_builder=self.prompt_builder,
        )

        generation_time = (
            time.perf_counter() - timing_start
        )

        logger.info(
            "[TIMING] Generation: %.3f s",
            generation_time,
        )

        # =====================================================================
        # 8. BUILD RESPONSE
        # =====================================================================

        response = ChatResponse(
            message_id=None,
            answer=gen_result.answer,
            sources=gen_result.sources,
            confidence=gen_result.confidence,
            used_fallback=gen_result.used_fallback,
            intent="rag",
        )

        # =====================================================================
        # 9. SAVE ASSISTANT RESPONSE
        # =====================================================================

        timing_start = time.perf_counter()

        msg_id = self.store.add_message(
            session_id,
            "assistant",
            response.answer,
            confidence=response.confidence,
            used_fallback=response.used_fallback,
            sources=response.sources,
        )

        assistant_save_time = (
            time.perf_counter() - timing_start
        )

        response.message_id = msg_id

        logger.info(
            "[TIMING] Save assistant message: %.3f s",
            assistant_save_time,
        )

        # =====================================================================
        # 10. CACHE SUCCESSFUL ANSWER
        # =====================================================================

        if not gen_result.used_fallback:

            self._cache_set(
                cache_key,
                response,
            )

        # =====================================================================
        # TEMPORARY PERFORMANCE SUMMARY
        # Smoke-test instrumentation only.
        # =====================================================================

        total_time = (
            time.perf_counter() - total_start
        )

        logger.info(
            "[TIMING] TOTAL REQUEST: %.3f s",
            total_time,
        )

        logger.info(
            "[TIMING] =================================================="
        )

        return response

    # =========================================================================
    # FEEDBACK
    # =========================================================================

    def record_feedback(
        self,
        message_id: int,
        positive: bool,
    ) -> None:

        self.store.set_feedback(
            message_id,
            positive,
        )

