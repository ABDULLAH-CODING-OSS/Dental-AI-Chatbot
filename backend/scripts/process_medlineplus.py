import xml.etree.ElementTree as ET
import os
import re

def parse_medlineplus_xml(data_dir, output_dir="rag_docs"):
    if not os.path.exists(data_dir):
        print(f"Error: Could not find XML file at: {data_dir}")
        return

    os.makedirs(output_dir, exist_ok=True)
    print(f"Parsing MedlinePlus XML file... Please wait.")

    try:
        tree = ET.parse(data_dir)
        root = tree.getroot()
    except Exception as e:
        print(f"Failed to parse XML: {e}")
        return

    count = 0
    for topic in root.findall('.//health-topic'):
        language = topic.get("language", "English")
        if language.lower() != "english":
            continue

        # title is an ATTRIBUTE on <health-topic>, not a child element
        title = topic.get("title")
        if not title:
            continue

        # full-summary is a child element; may contain HTML tags in its text
        summary_elem = topic.find('full-summary')
        if summary_elem is None:
            summary_elem = topic.find('FullSummary')  # fallback for older schema

        if summary_elem is not None and summary_elem.text:
            # itertext() grabs text even if there are nested <p>/<a> tags inside
            summary = "".join(summary_elem.itertext()).strip()
            summary = re.sub(r'\s+', ' ', summary)  # collapse whitespace
        else:
            summary = "No summary provided."

        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        filename = f"{safe_title}.txt"

        file_path = os.path.join(output_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"Topic: {title}\n\n{summary}")
        count += 1

    print(f"SUCCESS! Extracted {count} health topics into your {output_dir}/ folder.")

if __name__ == "__main__":
    xml_path = r"D:\6th Semester\NAVTACC\Dental-AI-Chatbot\Dental-AI-Chatbot\backend\data_sources\mplus_topics_2026-08-06.xml"
    parse_medlineplus_xml(xml_path, output_dir="rag_docs")