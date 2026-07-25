"""
retrieval.py
Production-grade hybrid retrieval engine for the SBBWU RAG chatbot.

Pipeline: query expansion -> hybrid (FAISS + BM25) candidate generation
-> score fusion -> metadata/temporal aware boosting -> near-duplicate
removal -> cross-encoder reranking -> dynamic top-k selection ->
confidence + out-of-domain estimation.

Design goals: fail loudly and clearly, be observable (logging), be
testable (class-based, no import-time query execution), and expose a
typed result object the generation layer can consume directly.
"""

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
    chunks_path: str = os.getenv("CHUNKS_PATH", "chunked_data.json")
    faiss_index_path: str = os.getenv("FAISS_INDEX_PATH", "vectorstore/faiss_index.bin")
    embedding_model_name: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-base-en-v1.5")
    reranker_model_name: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

    query_instruction: str = "query: "          # must match how passages were prefixed ("passage: ")

    faiss_k: int = 50
    bm25_k: int = 30
    hybrid_top_k: int = 20
    bm25_weight: float = 0.35                   # weight given to BM25 vs FAISS in fused score

    category_boost: float = 1.15
    temporal_boost: float = 1.10

    near_duplicate_threshold: float = 0.92       # difflib quick_ratio cutoff

    min_dynamic_k: int = 3
    max_dynamic_k: int = 10
    dynamic_score_drop: float = 0.35             # cut off once score falls this far below the top hit
    min_dynamic_k_floor: float = 0.35            # never include a chunk below this, even to reach min_dynamic_k

    min_confidence: float = 0.15                 # below this, treat as out-of-domain / low confidence


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
    confidence: float = 0.0
    is_out_of_domain: bool = False
    context_text: str = ""


# =============================================================================
# ENGINE
# =============================================================================

class RetrievalEngine:
    """Loads all artifacts once and serves retrieve() calls."""

    _TEMPORAL_CURRENT = {"current", "present", "now", "today", "existing", "incumbent"}
    _TEMPORAL_PAST = {"former", "previous", "old", "past", "ex", "earlier"}

    _EXPANSION_MAP = {
        r"\bprevious vc\b": "former previous old vice chancellor",
        r"\bold vc\b": "former previous vice chancellor",
        r"\bfirst vc\b": "first vice chancellor founder",
        r"\bvc\b": "vice chancellor university head",
        r"\bstaff\b": "faculty teachers professors",
        r"\bcontact\b": "email phone telephone address",
        r"\bdepartment\b": "department section",
    }

    def __init__(self, config: Optional[RetrievalConfig] = None):
        self.config = config or RetrievalConfig()
        self._load_data()
        self._load_models()
        self._build_bm25()
        self._build_category_index()
        logger.info("RetrievalEngine ready: %d chunks indexed", len(self.chunks))

    # ---------------- Loading ----------------

    def _load_data(self) -> None:
        try:
            with open(self.config.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
        except FileNotFoundError as e:
            raise RetrievalError(f"Missing chunk data file: {self.config.chunks_path}") from e
        except json.JSONDecodeError as e:
            raise RetrievalError(f"Corrupted JSON in {self.config.chunks_path}") from e

        if not self.chunks:
            raise RetrievalError("Chunk data file is empty")

        try:
            self.index = faiss.read_index(self.config.faiss_index_path)
        except Exception as e:
            raise RetrievalError(f"Could not load FAISS index at {self.config.faiss_index_path}") from e

        if self.index.ntotal != len(self.chunks):
            raise RetrievalError(
                f"FAISS index size ({self.index.ntotal}) does not match "
                f"chunk count ({len(self.chunks)}) — rebuild the index."
            )

    def _load_models(self) -> None:
        try:
            self.embedding_model = SentenceTransformer(self.config.embedding_model_name)
            self.reranker = CrossEncoder(self.config.reranker_model_name)
        except Exception as e:
            raise RetrievalError("Failed to load embedding/reranker models") from e

    def _build_bm25(self) -> None:
        self.corpus_tokens = [self._tokenize(c["text"]) for c in self.chunks]
        self.bm25 = BM25Okapi(self.corpus_tokens)

    def _build_category_index(self) -> None:
        self.category_map: Dict[str, List[int]] = {}
        for i, c in enumerate(self.chunks):
            cat = (c.get("category") or "general").lower()
            self.category_map.setdefault(cat, []).append(i)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        return text.split()

    # ---------------- Query understanding ----------------

    def expand_query(self, query: str) -> str:
        q = query.lower()
        for pattern, replacement in self._EXPANSION_MAP.items():
            q = re.sub(pattern, replacement, q)
        return q

    def detect_temporal_intent(self, query: str) -> Optional[str]:
        tokens = set(self._tokenize(query))
        if tokens & self._TEMPORAL_PAST:
            return "past"
        if tokens & self._TEMPORAL_CURRENT:
            return "current"
        return None

    def detect_category_hint(self, query: str) -> Optional[str]:
        # Token-based match instead of raw substring: robust even if word
        # order differs slightly, and doesn't depend on categories being
        # formatted a specific way upstream.
        query_tokens = set(self._tokenize(query))
        best_match: Optional[str] = None
        best_overlap = 0
        for cat in self.category_map:
            cat_tokens = set(self._tokenize(cat))
            if not cat_tokens:
                continue
            if cat_tokens.issubset(query_tokens) and len(cat_tokens) > best_overlap:
                best_match = cat
                best_overlap = len(cat_tokens)
        return best_match

    # ---------------- Candidate generation ----------------

    @lru_cache(maxsize=256)
    def _encode_query_cached(self, query: str) -> Tuple[float, ...]:
        text = f"{self.config.query_instruction}{query}"
        vec = self.embedding_model.encode([text], normalize_embeddings=True)
        return tuple(vec[0].astype("float32").tolist())

    def faiss_search(self, query: str, k: int) -> List[Tuple[int, float]]:
        vec = np.array([self._encode_query_cached(query)], dtype="float32")
        scores, ids = self.index.search(vec, k)
        return [(int(i), float(s)) for i, s in zip(ids[0], scores[0]) if i != -1]

    def bm25_search(self, query: str, k: int) -> List[Tuple[int, float]]:
        tokens = self._tokenize(query)
        scores = self.bm25.get_scores(tokens)
        top = np.argsort(scores)[::-1][:k]
        return [(int(i), float(scores[i])) for i in top]

    @staticmethod
    def _normalize(scores: Dict[int, float]) -> Dict[int, float]:
        if not scores:
            return {}
        vals = list(scores.values())
        lo, hi = min(vals), max(vals)
        if hi - lo < 1e-9:
            return {k: 1.0 for k in scores}
        return {k: (v - lo) / (hi - lo) for k, v in scores.items()}

    def score_fusion(
        self,
        faiss_hits: List[Tuple[int, float]],
        bm25_hits: List[Tuple[int, float]],
    ) -> Dict[int, float]:
        faiss_scores = self._normalize({i: s for i, s in faiss_hits})
        bm25_scores = self._normalize({i: s for i, s in bm25_hits})
        w = self.config.bm25_weight

        fused: Dict[int, float] = {}
        for i, s in faiss_scores.items():
            fused[i] = fused.get(i, 0.0) + (1 - w) * s
        for i, s in bm25_scores.items():
            fused[i] = fused.get(i, 0.0) + w * s
        return fused

    def _remove_near_duplicates(self, indices: List[int]) -> List[int]:
        kept: List[int] = []
        kept_texts: List[str] = []
        for i in indices:
            text = self.chunks[i]["text"].strip().lower()
            if any(
                difflib.SequenceMatcher(None, text, kt).quick_ratio() >= self.config.near_duplicate_threshold
                for kt in kept_texts
            ):
                continue
            kept.append(i)
            kept_texts.append(text)
        return kept

    def hybrid_search(self, query: str) -> List[int]:
        expanded = self.expand_query(query)
        faiss_hits = self.faiss_search(expanded, self.config.faiss_k)
        bm25_hits = self.bm25_search(expanded, self.config.bm25_k)
        fused = self.score_fusion(faiss_hits, bm25_hits)

        category_hint = self.detect_category_hint(query)
        if category_hint:
            allowed = set(self.category_map.get(category_hint, []))
            if allowed:
                fused = {i: (s * self.config.category_boost if i in allowed else s) for i, s in fused.items()}

        ranked = sorted(fused, key=lambda i: fused[i], reverse=True)
        ranked = self._remove_near_duplicates(ranked)
        return ranked[: self.config.hybrid_top_k]

    # ---------------- Reranking & selection ----------------

    def rerank(self, query: str, candidate_indices: List[int]) -> List[Tuple[int, float]]:
        if not candidate_indices:
            return []
        pairs = []
        for i in candidate_indices:
            c = self.chunks[i]
            doc = f"""
Title:
{c.get('title', '')}

Category:
{c.get('category', '')}

Topics:
{', '.join(c.get('tags', []))}

Information:
{c['text']}
""".strip()
            pairs.append((query, doc))

        raw_scores = self.reranker.predict(pairs)
        confidence = 1 / (1 + np.exp(-np.array(raw_scores)))  # sigmoid -> [0,1] confidence proxy
        ranked = sorted(zip(candidate_indices, confidence), key=lambda x: x[1], reverse=True)
        return [(i, float(s)) for i, s in ranked]

    def apply_temporal_filter(self, query: str, ranked: List[Tuple[int, float]]) -> List[Tuple[int, float]]:
        intent = self.detect_temporal_intent(query)
        if not intent:
            return ranked

        adjusted = []
        for i, s in ranked:
            text = self.chunks[i]["text"].lower()
            mentions_past = any(w in text for w in self._TEMPORAL_PAST)

            # Symmetric adjustment: boost the side that matches intent AND
            # penalize the side that doesn't, so "current" vs "previous"
            # actually separate instead of nearly tying (seen in testing:
            # a "Previous VC" chunk was ranking almost as high as the
            # correct "current VC" chunk with only a one-sided boost).
            wants_past = intent == "past"
            matches_intent = mentions_past if wants_past else not mentions_past
            s = s * self.config.temporal_boost if matches_intent else s / self.config.temporal_boost

            s = min(s, 1.0)  # confidence must stay a valid 0-1 value after boosting
            adjusted.append((i, s))
        adjusted.sort(key=lambda x: x[1], reverse=True)
        return adjusted

    def dynamic_top_k(self, ranked: List[Tuple[int, float]]) -> List[Tuple[int, float]]:
        if not ranked:
            return []
        top_score = ranked[0][1]
        selected = []
        for i, s in ranked:
            if len(selected) >= self.config.max_dynamic_k:
                break
            if s < self.config.min_dynamic_k_floor:
                continue  # too weak to include, regardless of min_dynamic_k
            if len(selected) < self.config.min_dynamic_k or (top_score - s) <= self.config.dynamic_score_drop:
                selected.append((i, s))
        return selected

    # ---------------- Public API ----------------

    def retrieve(self, query: str) -> RetrievalResult:
        query = (query or "").strip()
        if not query:
            raise RetrievalError("Empty query")

        try:
            candidates = self.hybrid_search(query)
            if not candidates:
                logger.warning("No candidates found for query=%r", query)
                return RetrievalResult(query=query, is_out_of_domain=True)

            ranked = self.rerank(query, candidates)
            ranked = self.apply_temporal_filter(query, ranked)
            selected = self.dynamic_top_k(ranked)

            top_score = selected[0][1] if selected else 0.0
            is_ood = top_score < self.config.min_confidence

            if is_ood:
                logger.info("query=%r flagged out-of-domain (top_score=%.3f)", query, top_score)
                return RetrievalResult(query=query, confidence=round(top_score, 4), is_out_of_domain=True)

            result_chunks = [
                RetrievedChunk(
                    chunk_id=self.chunks[i]["chunk_id"],
                    text=self.chunks[i]["text"],
                    title=self.chunks[i].get("title", ""),
                    category=self.chunks[i].get("category", ""),
                    tags=self.chunks[i].get("tags", []),
                    score=round(score, 4),
                    source_id=self.chunks[i].get("source_id", ""),
                )
                for i, score in selected
            ]

            context_text = "\n\n".join(f"[Source: {c.title or c.category}]\n{c.text}" for c in result_chunks)

            logger.info(
                "query=%r candidates=%d selected=%d top_score=%.3f",
                query, len(candidates), len(result_chunks), top_score,
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


# =============================================================================
# MANUAL SMOKE TEST
# =============================================================================

if __name__ == "__main__":
    engine = RetrievalEngine()

    test_queries = [
        "Where can I submit my admission application?",
        "Who is the current Vice Chancellor?",
        "Who was the previous Vice Chancellor?",
        "What's the weather like today?",  # expected: out-of-domain
        "what are the hostel rules?",
        "How many affiliated colleges are there?",
    ]

    for q in test_queries:
        result = engine.retrieve(q)

        print("\n" + "=" * 100)
        print(f"QUERY: {q}")
        print(f"Confidence      : {result.confidence:.3f}")
        print(f"Out of Domain   : {result.is_out_of_domain}")
        print(f"Retrieved Chunks: {len(result.chunks)}")
        print("=" * 100)

        for i, c in enumerate(result.chunks, start=1):
            print(f"\n--- Chunk {i} ---")
            print(f"Score     : {c.score:.4f}")
            print(f"Chunk ID  : {c.chunk_id}")
            print(f"Title     : {c.title}")
            print(f"Category  : {c.category}")
            print(f"Source ID : {c.source_id}")
            print("\nContent:")
            print("-" * 80)
            print(c.text)
            print("-" * 80)

        print("\n")