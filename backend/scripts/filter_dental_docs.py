import os
import shutil

DENTAL_KEYWORDS = [
    "tooth", "teeth", "dental", "dentist", "gum", "gingiv", "periodont",
    "oral", "mouth", "cavity", "cavities", "plaque", "tartar", "braces",
    "orthodont", "root canal", "filling", "crown", "denture", "flossing",
    "fluoride", "wisdom tooth", "bite", "jaw", "tmj", "enamel",
]

SOURCE_DIR = "rag_docs"
FILTERED_DIR = "rag_docs_dental_only"

os.makedirs(FILTERED_DIR, exist_ok=True)
kept = 0
skipped = 0

for filename in os.listdir(SOURCE_DIR):
    filepath = os.path.join(SOURCE_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read().lower()

    if any(keyword in content or keyword in filename.lower() for keyword in DENTAL_KEYWORDS):
        shutil.copy(filepath, os.path.join(FILTERED_DIR, filename))
        kept += 1
    else:
        skipped += 1

print(f"Kept {kept} dental-relevant files, skipped {skipped} unrelated files.")