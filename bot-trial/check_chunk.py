import json

with open("chunked_data.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

for chunk in chunks:

    text = chunk["text"].lower()

    if "vice chancellor" in text or "chancellor" in text:
        print("\nChunk ID:", chunk["chunk_id"])
        print(chunk["text"])
        print("=" * 100)