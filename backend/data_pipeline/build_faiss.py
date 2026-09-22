import numpy as np
import faiss
import os
import json


# =========================================
# LOAD EMBEDDINGS
# =========================================

embeddings = np.load("vectorstore/embeddings.npy")

print(
    "Embeddings Shape:",
    embeddings.shape
)


if embeddings.shape[0] == 0:
    raise ValueError(
        "Embeddings file is empty"
    )



# =========================================
# LOAD CHUNK DATA
# =========================================

with open(
    "knowledge_base/processed/chunked_data.json",
    "r",
    encoding="utf-8"
) as f: 

    chunks = json.load(f)



# =========================================
# VERIFY ALIGNMENT
# =========================================

if len(chunks) != embeddings.shape[0]:

    raise ValueError(
        f"""
Mismatch detected:

Chunks:
{len(chunks)}

Embeddings:
{embeddings.shape[0]}
"""
    )


print(
    "Chunk and embedding count matched"
)



# =========================================
# NORMALIZE FOR COSINE SIMILARITY
# =========================================

faiss.normalize_L2(
    embeddings
)



# =========================================
# CREATE FAISS INDEX
# =========================================

dimension = embeddings.shape[1]


index = faiss.IndexFlatIP(
    dimension
)



# =========================================
# ADD VECTORS
# =========================================

index.add(
    embeddings
)



print(
    "Total vectors stored:",
    index.ntotal
)



# =========================================
# SAVE INDEX
# =========================================

os.makedirs(
    "vectorstore",
    exist_ok=True
)


faiss.write_index(
    index,
    "vectorstore/faiss_index.bin"
)



print(
    "FAISS index rebuilt successfully"
)


print(
    "Saved:"
    " vectorstore/faiss_index.bin"
)