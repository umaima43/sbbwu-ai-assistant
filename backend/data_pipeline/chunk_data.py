import re
import json
import uuid

# =====================================
# CONFIG
# =====================================

MAX_CHUNK_WORDS = 180        # roughly ~240-260 tokens for bge-base — safely under its limit
OVERLAP_SENTENCES = 1        # carry the last sentence of a piece into the next piece for continuity


# =====================================
# SPLIT LONG CONTENT INTO SENTENCE-AWARE PIECES
# =====================================

def split_sentences(text):
    # Simple, dependency-free sentence splitter. Good enough for clean
    # prose like this dataset; doesn't need to be perfect.
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def split_long_content(content, max_words=MAX_CHUNK_WORDS, overlap_sentences=OVERLAP_SENTENCES):
    """Splits content into a list of pieces, each under max_words, without
    cutting a sentence in half. Short content (the common case) is
    returned as a single-item list unchanged."""
    if len(content.split()) <= max_words:
        return [content]

    sentences = split_sentences(content)
    pieces = []
    current = []
    current_words = 0

    for sentence in sentences:
        sentence_words = len(sentence.split())

        if current_words + sentence_words > max_words and current:
            pieces.append(" ".join(current))
            # start next piece with overlap from the end of this one
            current = current[-overlap_sentences:] if overlap_sentences else []
            current_words = sum(len(s.split()) for s in current)

        current.append(sentence)
        current_words += sentence_words

    if current:
        pieces.append(" ".join(current))

    return pieces


# =====================================
# LOAD CLEAN DATA
# =====================================

with open("knowledge_base/processed/clean_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)


chunks = []


# =====================================
# CREATE SEMANTIC CHUNKS
# =====================================

for item in data:
    category = item.get("category", "general")
    tags = item.get("tags", [])
    title = item.get("title", "")
    content = item.get("content", "").strip()
    source_id = item.get("id", "")

    if not content:
        continue

    pieces = split_long_content(content)
    multi_part = len(pieces) > 1

    for part_index, piece in enumerate(pieces, start=1):
        chunk_id = str(uuid.uuid4())

        piece_title = f"{title} (part {part_index}/{len(pieces)})" if multi_part else title

        # ===============================
        # Embed metadata + meaning together
        # ===============================
        embedding_text = f"""

Category:
{category}


Topics:
{', '.join(tags)}


Information:
{piece}

""".strip()

        chunks.append({
            "chunk_id": chunk_id,
            "source_id": source_id,
            "category": category,
            "tags": tags,
            "title": piece_title,
            "text": piece,
            "embedding_text": embedding_text,
        })


# =====================================
# SAVE
# =====================================

with open("knowledge_base/processed/chunked_data.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, indent=2, ensure_ascii=False)

print("Semantic chunking completed")
print("Total chunks:", len(chunks))
print("Source records:", len(data))