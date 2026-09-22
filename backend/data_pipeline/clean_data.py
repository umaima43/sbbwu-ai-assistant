import os
import re
import json
import hashlib


# =========================================
# NORMALIZE TEXT (LIGHT CLEANING ONLY)
# =========================================
def normalize(text):
    if not isinstance(text, str):
        return ""
    return " ".join(text.split()).strip()


def normalize_label(text):
    """Turns 'academic_section' into 'academic section'. Used for both
    category and tags so they match how people actually type questions."""
    if not isinstance(text, str):
        return ""
    return text.replace("_", " ").replace("-", " ").strip().lower()


def clean_tags(tags):
    if not tags:
        return []
    return [normalize_label(t) for t in tags if normalize_label(t)]


# =========================================
# CREATE DEDUPLICATION HASH
# =========================================
def create_hash(content, category):
    combined = f"{category}||{content}"
    return hashlib.md5(combined.encode("utf-8")).hexdigest()


# =========================================
# BUILD A FALLBACK TITLE
# =========================================
def derive_title(existing_title, category_label, tags):
    """Uses the real title if given; otherwise builds a short, readable
    one from category + the first tag, since your data has no title field."""
    if existing_title:
        return existing_title

    category_title = category_label.title() if category_label else "General"

    if tags:
        return f"{tags[0].title()} — {category_title}"

    return category_title


# =========================================
# LOAD + SAFE CLEAN
# =========================================
def load_and_clean(folder_path, long_content_word_threshold=180):
    clean_data = []
    seen = set()
    id_registry = {}  # tracks original ids to detect accidental collisions

    total_records = 0
    duplicates_removed = 0
    empty_removed = 0
    broken_files = 0
    long_content_count = 0

    for root, _, files in os.walk(folder_path):
        for file in files:
            if not file.endswith(".json"):
                continue

            path = os.path.join(root, file)

            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if isinstance(data, dict):
                    data = [data]

                if not isinstance(data, list):
                    continue

                for item in data:
                    total_records += 1

                    if not isinstance(item, dict):
                        continue

                    # =========================
                    # GET FIELDS
                    # =========================
                    raw_id = normalize(item.get("id", ""))
                    title = normalize(item.get("title", ""))
                    content = normalize(item.get("content", ""))
                    url = normalize(item.get("url", ""))
                    category_label = normalize_label(item.get("category", "general")) or "general"
                    tags = clean_tags(item.get("tags", []))

                    # =========================
                    # REMOVE ONLY TRULY EMPTY
                    # =========================
                    if not title and not content and not url:
                        empty_removed += 1
                        continue

                    # =========================
                    # EXACT DUPLICATE CHECK
                    # =========================
                    dedup_hash = create_hash(content, category_label)
                    if dedup_hash in seen:
                        duplicates_removed += 1
                        continue
                    seen.add(dedup_hash)

                    # =========================
                    # SOURCE ID (preserve original; fall back to hash)
                    # =========================
                    source_id = raw_id or dedup_hash
                    if source_id in id_registry:
                        # Same id seen twice across files — keep both records,
                        # but make the id unique so nothing downstream collides.
                        source_id = f"{source_id}_{id_registry[source_id]}"
                        id_registry[raw_id or dedup_hash] = id_registry.get(raw_id or dedup_hash, 1) + 1
                    else:
                        id_registry[source_id] = 1

                    # =========================
                    # LONG CONTENT WARNING (informational only)
                    # =========================
                    word_count = len(content.split())
                    if word_count > long_content_word_threshold:
                        long_content_count += 1

                    # =========================
                    # SAVE CLEAN RECORD
                    # =========================
                    clean_data.append({
                        "id": source_id,
                        "title": derive_title(title, category_label, tags),
                        "content": content,
                        "url": url,
                        "category": category_label,
                        "tags": tags,
                        "source_file": file,
                        "word_count": word_count,
                    })

            except Exception as e:
                broken_files += 1
                print(f"Broken file: {path}")
                print("Error:", e)

    # =====================================
    # FINAL REPORT
    # =====================================
    print("\n========== CLEANING REPORT ==========")
    print("Total records found      :", total_records)
    print("Final clean records      :", len(clean_data))
    print("Exact duplicates removed :", duplicates_removed)
    print("Empty records removed    :", empty_removed)
    print("Broken files             :", broken_files)
    print(f"Long records (>{long_content_word_threshold} words) :", long_content_count,
          "— these will be split during chunking")
    print("=====================================\n")

    return clean_data

# =========================================
# RUN SCRIPT
# =========================================
if __name__ == "__main__":
    clean_data = load_and_clean("knowledge_base/raw")

    with open("knowledge_base/processed/clean_data.json", "w", encoding="utf-8") as f:
        json.dump(clean_data, f, indent=2, ensure_ascii=False)

    print("clean_data.json created successfully")
print("TEST FILES:")
for root, dirs, files in os.walk("knowledge_base/raw"):
    print("ROOT:", root)
    print("FILES:", files)