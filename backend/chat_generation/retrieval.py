from __future__ import annotations

import os
import re
import json
import logging
import difflib

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from functools import lru_cache

import numpy as np
import faiss
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder


# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("retrieval")


# =============================================================================
# CONFIG
# =============================================================================


@dataclass
class RetrievalConfig:
    chunks_path: str = os.getenv(
        "CHUNKS_PATH",
        "knowledge_base/processed/chunked_data.json",
    )

    faiss_index_path: str = os.getenv(
        "FAISS_INDEX_PATH",
        "vectorstore/faiss_index.bin",
    )

    embedding_model_name: str = os.getenv(
        "EMBEDDING_MODEL",
        "BAAI/bge-base-en-v1.5",
    )

    reranker_model_name: str = os.getenv(
        "RERANKER_MODEL",
        "cross-encoder/ms-marco-MiniLM-L-6-v2",
    )

    query_instruction: str = "query: "

    # Candidate generation
    faiss_k: int = 50
    bm25_k: int = 30
    hybrid_top_k: int = 20

    # RRF fusion
    rrf_k: int = 60
    faiss_rrf_weight: float = 0.65
    bm25_rrf_weight: float = 0.35

    # Metadata boosting
    category_boost: float = 1.15
    temporal_boost: float = 1.10

    # Duplicate filtering
    near_duplicate_threshold: float = 0.92

    # Dynamic top-k
    min_dynamic_k: int = 3
    max_dynamic_k: int = 10
    dynamic_score_drop: float = 0.30
    min_dynamic_k_floor: float = 0.20

    # Retrieval/OOD threshold.
    #
    # This is a reranker-score threshold after sigmoid transformation.
    # It is a practical retrieval threshold, NOT a calibrated probability.
    min_confidence: float = 0.15

    # Contextual follow-up widening
    contextual_history_turns: int = 2
    contextual_max_followup_words: int = 10


class RetrievalError(Exception):
    """Raised for any unrecoverable failure in the retrieval pipeline."""


# =============================================================================
# OUTPUT TYPES
# =============================================================================


@dataclass
class RetrievedChunk:
    chunk_id: str
    text: str
    title: str
    category: str
    tags: List[str]
    score: float
    source_id: str = ""


@dataclass
class RetrievalResult:
    query: str
    chunks: List[RetrievedChunk] = field(default_factory=list)

    # Kept for compatibility with the generation layer.
    # This represents the best reranker-derived retrieval score,
    # not a calibrated probability.
    confidence: float = 0.0

    is_out_of_domain: bool = False
    context_text: str = ""


# =============================================================================
# ENGINE
# =============================================================================


class RetrievalEngine:
    """Loads all retrieval artifacts once and serves retrieve() calls."""

    _TEMPORAL_CURRENT = {
        "current",
        "present",
        "now",
        "today",
        "existing",
        "incumbent",
    }

    _TEMPORAL_PAST = {
        "former",
        "previous",
        "old",
        "past",
        "ex",
        "earlier",
    }

    _FOLLOWUP_HINT_WORDS = {
        "it",
        "its",
        "it's",
        "he",
        "she",
        "they",
        "his",
        "her",
        "their",
        "them",
        "that",
        "this",
        "one",
    }

    # Lightweight deterministic expansion.
    #
    # Query Understanding remains responsible for semantic normalization.
    # These rules are kept small and retrieval-focused.
    _EXPANSION_MAP = {
        r"\bprevious vc\b": "former previous old vice chancellor",
        r"\bold vc\b": "former previous vice chancellor",
        r"\bfirst vc\b": "first vice chancellor founder",
        r"\bvc\b": "vice chancellor university head",
        r"\bbs cs\b": "bachelor of science computer science department program",
        r"\bcs\b": "computer science department program faculty",
        r"\bbs\b": "bachelor of science undergraduate program degree",
        r"\bms\b": "master of science postgraduate program",
        r"\bm\.?\s*phil\b": "m phil master philosophy postgraduate program",
        r"\bphd\b": "phd doctorate doctoral program",
        r"\bbba\b": "bachelor business administration program",
        r"\bllb\b": "bachelor laws program",
        r"\boric\b": "office research innovation commercialization",
        r"\bqec\b": "quality enhancement cell",
        r"\bhod\b": "head department chairperson",
        r"\bavailable\b": "offered available list",
        r"\badmission\b": "admission apply application enroll",
        r"\bhostel\b": "hostel accommodation provost fee",
        r"\bfee\b": "fee fees voucher payment cost",
        r"\bstaff\b": "faculty teachers professors",
        r"\bcontact\b": "email phone telephone address",
        r"\bdepartment\b": "department section program",
    }

    def __init__(self, config: Optional[RetrievalConfig] = None):
        self.config = config or RetrievalConfig()

        self._load_data()
        self._load_models()
        self._build_bm25()
        self._build_category_index()

        logger.info("RetrievalEngine ready: %d chunks indexed", len(self.chunks))

    # =========================================================================
    # LOADING
    # =========================================================================

    def _load_data(self) -> None:
        """Load chunk metadata and FAISS index."""

        try:
            with open(self.config.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)

        except FileNotFoundError as e:
            raise RetrievalError(
                f"Missing chunk data file: {self.config.chunks_path}"
            ) from e

        except json.JSONDecodeError as e:
            raise RetrievalError(f"Corrupted JSON in {self.config.chunks_path}") from e

        if not self.chunks:
            raise RetrievalError("Chunk data file is empty")

        try:
            self.index = faiss.read_index(self.config.faiss_index_path)

        except Exception as e:
            raise RetrievalError(
                f"Could not load FAISS index at {self.config.faiss_index_path}"
            ) from e

        if self.index.ntotal != len(self.chunks):
            raise RetrievalError(
                f"FAISS index size ({self.index.ntotal}) does not "
                f"match chunk count ({len(self.chunks)}) — "
                "rebuild the index."
            )

    def _find_cached_model_snapshot(self, model_repo: str) -> str:
        """
        Find the locally cached Hugging Face snapshot.

        Models are loaded directly from the local cache so that
        startup does not require an unnecessary online lookup.
        """

        repo_dir_name = "models--" + model_repo.replace("/", "--")

        hf_cache = os.path.expanduser(
            os.getenv("HF_HOME", os.path.join("~", ".cache", "huggingface"))
        )

        repo_path = os.path.join(hf_cache, "hub", repo_dir_name)

        snapshots_path = os.path.join(repo_path, "snapshots")

        if not os.path.isdir(snapshots_path):
            raise RetrievalError(
                "Cached Hugging Face model not found locally: "
                f"{model_repo}\n"
                f"Expected cache directory: {repo_path}"
            )

        snapshots = [
            os.path.join(snapshots_path, name)
            for name in os.listdir(snapshots_path)
            if os.path.isdir(os.path.join(snapshots_path, name))
        ]

        if not snapshots:
            raise RetrievalError(
                f"No cached snapshot found for model: {model_repo}\n"
                f"Expected snapshots directory: {snapshots_path}"
            )

        snapshots.sort(key=lambda path: os.path.getmtime(path), reverse=True)

        return snapshots[0]

    def _load_models(self) -> None:
        """Load embedding and reranker models from local cache."""

        try:
            # -----------------------------------------------------------------
            # Embedding model
            # -----------------------------------------------------------------

            embedding_model_path = os.getenv("EMBEDDING_MODEL_PATH")

            if not embedding_model_path:
                embedding_model_path = self._find_cached_model_snapshot(
                    self.config.embedding_model_name
                )

            logger.info(
                "Loading embedding model from local path: %s",
                embedding_model_path,
            )

            self.embedding_model = SentenceTransformer(embedding_model_path)

            logger.info(
                "Embedding model loaded successfully: %s",
                self.config.embedding_model_name,
            )

            # -----------------------------------------------------------------
            # Reranker model
            # -----------------------------------------------------------------

            reranker_model_path = os.getenv("RERANKER_MODEL_PATH")

            if not reranker_model_path:
                reranker_model_path = self._find_cached_model_snapshot(
                    self.config.reranker_model_name
                )

            logger.info(
                "Loading reranker model from local path: %s",
                reranker_model_path,
            )

            self.reranker = CrossEncoder(reranker_model_path)

            logger.info(
                "Reranker model loaded successfully: %s",
                self.config.reranker_model_name,
            )

        except RetrievalError:
            raise

        except Exception as e:
            logger.exception("Failed to load embedding/reranker models")

            raise RetrievalError("Failed to load embedding/reranker models") from e

    def _build_bm25(self) -> None:
        """Build the BM25 index from chunk text."""

        self.corpus_tokens = [self._tokenize(c.get("text", "")) for c in self.chunks]

        self.bm25 = BM25Okapi(self.corpus_tokens)

    def _build_category_index(self) -> None:
        """Build category -> chunk index."""

        self.category_map: Dict[str, List[int]] = {}

        for i, c in enumerate(self.chunks):
            category = (c.get("category") or "general").lower()

            self.category_map.setdefault(category, []).append(i)

    # =========================================================================
    # TEXT HELPERS
    # =========================================================================

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """
        Simple normalized tokenizer used by BM25 and metadata checks.
        """

        text = (text or "").lower()

        text = re.sub(r"[^a-z0-9\s]", " ", text)

        return text.split()

    # =========================================================================
    # CONTEXTUAL QUERY BUILDING
    # =========================================================================

    def build_contextual_query(
        self,
        query: str,
        history: Optional[List[Dict]] = None,
    ) -> str:
        """
        Pure-Python, zero-network follow-up widening.

        This only changes the internal search string.

        The widened query is never shown to the user or sent as the
        user's actual question to the generation layer.
        """

        q = (query or "").strip()

        if not q or not history:
            return q

        words = q.lower().split()

        looks_like_followup = (
            len(words) <= self.config.contextual_max_followup_words
            and bool(self._FOLLOWUP_HINT_WORDS & set(words))
        )


        if not looks_like_followup:
            return q

        recent = history[-self.config.contextual_history_turns :]

        context_terms = " ".join(t.get("content", "") for t in recent)

        widened = (f"{q} {context_terms}").strip()

        logger.debug(
            "build_contextual_query: widened follow-up query=%r -> %r",
            q,
            widened,
        )

        return widened

    # =========================================================================
    # QUERY NORMALIZATION
    # =========================================================================

    def expand_query(self, query: str) -> str:
        """
        Apply lightweight deterministic retrieval expansion.

        This is intentionally limited. Semantic query understanding
        remains the responsibility of the Query Understanding layer.
        """

        q = (query or "").lower()

        for pattern, replacement in self._EXPANSION_MAP.items():
            q = re.sub(pattern, replacement, q)

        return q

    def detect_temporal_intent(self, query: str) -> Optional[str]:
        """Detect simple current/past temporal intent."""

        tokens = set(self._tokenize(query))

        if tokens & self._TEMPORAL_PAST:
            return "past"

        if tokens & self._TEMPORAL_CURRENT:
            return "current"

        return None

    def detect_category_hint(self, query: str) -> Optional[str]:
        """
        Detect a category when all normalized category tokens
        are explicitly represented in the query.

        Underscores are naturally normalized by _tokenize().
        """

        query_tokens = set(self._tokenize(query))

        best_match: Optional[str] = None
        best_overlap = 0

        for category in self.category_map:
            category_tokens = set(self._tokenize(category))

            if not category_tokens:
                continue

            if (
                category_tokens.issubset(query_tokens)
                and len(category_tokens) > best_overlap
            ):
                best_match = category
                best_overlap = len(category_tokens)

        return best_match

    # =========================================================================
    # QUERY EMBEDDING
    # =========================================================================

    @lru_cache(maxsize=256)
    def _encode_query_cached(self, query: str) -> Tuple[float, ...]:
        """Encode and cache a normalized query."""

        text = f"{self.config.query_instruction}{query}"

        vec = self.embedding_model.encode([text], normalize_embeddings=True)

        return tuple(vec[0].astype("float32").tolist())

    # =========================================================================
    # CANDIDATE GENERATION
    # =========================================================================

    def faiss_search(self, query: str, k: int) -> List[Tuple[int, float]]:
        """Semantic FAISS retrieval."""

        vec = np.array([self._encode_query_cached(query)], dtype="float32")

        scores, ids = self.index.search(vec, k)

        return [(int(i), float(s)) for i, s in zip(ids[0], scores[0]) if i != -1]

    def bm25_search(self, query: str, k: int) -> List[Tuple[int, float]]:
        """Lexical BM25 retrieval."""

        tokens = self._tokenize(query)

        scores = self.bm25.get_scores(tokens)

        top = np.argsort(scores)[::-1][:k]

        return [(int(i), float(scores[i])) for i in top]

    # =========================================================================
    # RECIPROCAL RANK FUSION
    # =========================================================================

    def score_fusion(
        self,
        faiss_hits: List[Tuple[int, float]],
        bm25_hits: List[Tuple[int, float]],
    ) -> Dict[int, float]:
        """
        Combine FAISS and BM25 rankings using Reciprocal Rank Fusion.

        RRF avoids directly comparing incompatible FAISS and BM25
        score scales.

        score = weight / (rrf_k + rank)
        """

        fused: Dict[int, float] = {}

        faiss_weight = self.config.faiss_rrf_weight

        bm25_weight = self.config.bm25_rrf_weight

        rrf_k = self.config.rrf_k

        for rank, (index, _) in enumerate(faiss_hits, start=1):
            fused[index] = fused.get(index, 0.0) + faiss_weight / (rrf_k + rank)

        for rank, (index, _) in enumerate(bm25_hits, start=1):
            fused[index] = fused.get(index, 0.0) + bm25_weight / (rrf_k + rank)

        return fused

    # =========================================================================
    # DUPLICATE FILTERING
    # =========================================================================

    def _remove_near_duplicates(self, indices: List[int]) -> List[int]:
        """
        Remove highly similar textual duplicates.

        The dataset is currently small enough that SequenceMatcher
        remains practical here.
        """

        kept: List[int] = []
        kept_texts: List[str] = []

        for i in indices:
            text = self.chunks[i].get("text", "").strip().lower()

            is_duplicate = any(
                difflib.SequenceMatcher(None, text, kept_text).quick_ratio()
                >= self.config.near_duplicate_threshold
                for kept_text in kept_texts
            )

            if is_duplicate:
                continue

            kept.append(i)
            kept_texts.append(text)

        return kept

    # =========================================================================
    # HYBRID SEARCH
    # =========================================================================

    def hybrid_search(self, query: str) -> List[int]:
        """
        Generate a robust hybrid candidate pool.

        FAISS and BM25 are independently retrieved and then fused
        using RRF.
        """

        expanded = self.expand_query(query)

        # ---------------------------------------------------------------------
        # Independent retrieval
        # ---------------------------------------------------------------------

        faiss_hits = self.faiss_search(expanded, self.config.faiss_k)

        bm25_hits = self.bm25_search(expanded, self.config.bm25_k)

        # ---------------------------------------------------------------------
        # RRF fusion
        # ---------------------------------------------------------------------

        fused = self.score_fusion(faiss_hits, bm25_hits)

        # ---------------------------------------------------------------------
        # Category boost
        # ---------------------------------------------------------------------

        category_hint = self.detect_category_hint(query)

        if category_hint:
            allowed = set(self.category_map.get(category_hint, []))

            if allowed:
                fused = {
                    i: (score * self.config.category_boost if i in allowed else score)
                    for i, score in fused.items()
                }

        # ---------------------------------------------------------------------
        # Final hybrid ranking
        # ---------------------------------------------------------------------

        ranked = sorted(fused, key=fused.get, reverse=True)

        ranked = self._remove_near_duplicates(ranked)

        return ranked[: self.config.hybrid_top_k]

    # =========================================================================
    # CROSS-ENCODER RERANKING
    # =========================================================================

    def rerank(
        self,
        query: str,
        candidate_indices: List[int],
    ) -> List[Tuple[int, float]]:
        """
        Rerank hybrid candidates with the cross-encoder.

        Returned score is sigmoid-transformed for a stable [0, 1]
        ranking scale. It is NOT a calibrated probability.
        """

        if not candidate_indices:
            return []

        pairs = []

        for i in candidate_indices:
            chunk = self.chunks[i]

            doc = f"""
Title:
{chunk.get('title', '')}

Category:
{chunk.get('category', '')}

Topics:
{', '.join(chunk.get('tags', []))}

Information:
{chunk.get('text', '')}
""".strip()

            pairs.append((query, doc))

        raw_scores = self.reranker.predict(pairs)

        raw_scores = np.asarray(raw_scores, dtype=np.float32)

        # Numerical stability.
        raw_scores = np.clip(raw_scores, -20.0, 20.0)

        rerank_scores = 1.0 / (1.0 + np.exp(-raw_scores))

        ranked = sorted(
            zip(candidate_indices, rerank_scores),
            key=lambda x: x[1],
            reverse=True,
        )

        return [(index, float(score)) for index, score in ranked]

    # =========================================================================
    # TEMPORAL ADJUSTMENT
    # =========================================================================

    def apply_temporal_filter(
        self,
        query: str,
        ranked: List[Tuple[int, float]],
    ) -> List[Tuple[int, float]]:
        """
        Apply a lightweight temporal preference.

        This does not remove chunks. It only adjusts ranking.

        Token-level matching is used to avoid substring problems such
        as treating the letters "ex" inside unrelated words as a
        temporal signal.
        """

        intent = self.detect_temporal_intent(query)

        if not intent:
            return ranked

        adjusted = []

        for index, score in ranked:
            text_tokens = set(self._tokenize(self.chunks[index].get("text", "")))

            mentions_past = bool(text_tokens & self._TEMPORAL_PAST)

            wants_past = intent == "past"

            matches_intent = mentions_past if wants_past else not mentions_past

            if matches_intent:
                adjusted_score = score * self.config.temporal_boost
            else:
                adjusted_score = score / self.config.temporal_boost

            adjusted_score = min(adjusted_score, 1.0)

            adjusted.append((index, adjusted_score))

        adjusted.sort(key=lambda x: x[1], reverse=True)

        return adjusted

    # =========================================================================
    # DYNAMIC TOP-K
    # =========================================================================

    def dynamic_top_k(
        self,
        ranked: List[Tuple[int, float]],
    ) -> List[Tuple[int, float]]:
        """
        Select context size dynamically based on reranker scores.

        A small number of highly relevant chunks is preferred for
        focused questions, while broader evidence is retained when
        several chunks have similar relevance.
        """

        if not ranked:
            return []

        top_score = ranked[0][1]

        selected = []

        for index, score in ranked:

            if len(selected) >= self.config.max_dynamic_k:
                break

            if score < self.config.min_dynamic_k_floor:
                continue

            within_score_range = top_score - score <= self.config.dynamic_score_drop

            if len(selected) < self.config.min_dynamic_k or within_score_range:
                selected.append((index, score))

        return selected

    # =========================================================================
    # PUBLIC API
    # =========================================================================

    def retrieve(self, query: str) -> RetrievalResult:
        """
        Run the complete retrieval pipeline.
        """

        query = (query or "").strip()

        if not query:
            raise RetrievalError("Empty query")

        try:
            # -----------------------------------------------------------------
            # 1. Hybrid candidate generation
            # -----------------------------------------------------------------

            candidates = self.hybrid_search(query)

            if not candidates:
                logger.warning("No candidates found for query=%r", query)

                return RetrievalResult(query=query, is_out_of_domain=True)

            # -----------------------------------------------------------------
            # 2. Cross-encoder reranking
            # -----------------------------------------------------------------

            ranked = self.rerank(query, candidates)

            # -----------------------------------------------------------------
            # 3. Temporal adjustment
            # -----------------------------------------------------------------

            ranked = self.apply_temporal_filter(query, ranked)

            if not ranked:
                logger.warning("Reranking returned no results for query=%r", query)

                return RetrievalResult(query=query, is_out_of_domain=True)

            # -----------------------------------------------------------------
            # 4. Best actual retrieval score
            #
            # IMPORTANT:
            # Use ranked[0], not selected[0], for confidence/OOD.
            # Dynamic top-k decides how much context to return; it should
            # not determine whether the query is considered in-domain.
            # -----------------------------------------------------------------

            top_score = ranked[0][1]

            second_score = ranked[1][1] if len(ranked) > 1 else 0.0

            score_gap = top_score - second_score

            # -----------------------------------------------------------------
            # 5. OOD estimation
            #
            # This is a practical retrieval threshold, not a calibrated
            # probability.
            # -----------------------------------------------------------------

            is_ood = top_score < self.config.min_confidence

            if is_ood:
                logger.info(
                    "query=%r flagged out-of-domain "
                    "(rerank_score=%.3f, "
                    "second_score=%.3f, "
                    "score_gap=%.3f)",
                    query,
                    top_score,
                    second_score,
                    score_gap,
                )

                return RetrievalResult(
                    query=query,
                    confidence=round(top_score, 4),
                    is_out_of_domain=True,
                )

            # -----------------------------------------------------------------
            # 6. Dynamic context selection
            # -----------------------------------------------------------------

            selected = self.dynamic_top_k(ranked)

            # Safety fallback:
            #
            # If dynamic selection becomes too restrictive, keep the best
            # relevant result instead of returning an empty context.
            if not selected:
                selected = [ranked[0]]

            # -----------------------------------------------------------------
            # 7. Build typed result objects
            # -----------------------------------------------------------------

            result_chunks = []

            for index, score in selected:
                chunk = self.chunks[index]

                result_chunks.append(
                    RetrievedChunk(
                        chunk_id=chunk["chunk_id"],
                        text=chunk.get("text", ""),
                        title=chunk.get("title", ""),
                        category=chunk.get("category", ""),
                        tags=chunk.get("tags", []),
                        score=round(score, 4),
                        source_id=chunk.get("source_id", ""),
                    )
                )

            # -----------------------------------------------------------------
            # 8. Build generation context
            # -----------------------------------------------------------------

            context_text = "\n\n".join(
                (f"[Source: {chunk.title or chunk.category}]\n{chunk.text}")
                for chunk in result_chunks
            )

            # -----------------------------------------------------------------
            # 9. Observability
            # -----------------------------------------------------------------

            logger.info(
                "query=%r "
                "candidates=%d "
                "selected=%d "
                "top_score=%.3f "
                "second_score=%.3f "
                "score_gap=%.3f "
                "ood=False",
                query,
                len(candidates),
                len(result_chunks),
                top_score,
                second_score,
                score_gap,
            )

            return RetrievalResult(
                query=query,
                chunks=result_chunks,
                confidence=round(top_score, 4),
                is_out_of_domain=False,
                context_text=context_text,
            )

        except RetrievalError:
            raise

        except Exception as e:
            logger.exception("Unexpected retrieval failure for query=%r", query)

            raise RetrievalError(f"Retrieval failed: {e}") from e