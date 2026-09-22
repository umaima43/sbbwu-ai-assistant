import json
import numpy as np
from sentence_transformers import SentenceTransformer


# =====================================
# LOAD MODEL
# =====================================

model = SentenceTransformer(
    "BAAI/bge-base-en-v1.5"
)



# =====================================
# LOAD CHUNKS
# =====================================

with open(
    "knowledge_base/processed/chunked_data.json",
    "r",
    encoding="utf-8"
) as f:
    data = json.load(f)




texts = []

metadata = []



# =====================================
# PREPARE EMBEDDINGS
# =====================================

for item in data:


    text = (
        "passage: "
        +
        item["embedding_text"]
    )


    texts.append(text)



    metadata.append({

        "chunk_id":
        item["chunk_id"],


        "category":
        item["category"],


        "tags":
        item["tags"]

    })




# =====================================
# CREATE VECTORS
# =====================================

embeddings = model.encode(

    texts,

    normalize_embeddings=True,

    show_progress_bar=True

)



embeddings = np.array(

    embeddings,

    dtype="float32"

)




# =====================================
# SAVE
# =====================================

np.save(
    "vectorstore/embeddings.npy",
    embeddings
)

with open(
    "vectorstore/chunks_metadata.json",
    "w",
    encoding="utf-8"
) as f:


    json.dump(

        metadata,

        f,

        indent=2,

        ensure_ascii=False

    )



print(
    "BGE embeddings created successfully"
)

print(
    "Shape:",
    embeddings.shape
)