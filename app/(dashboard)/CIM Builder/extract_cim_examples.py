"""
Kingdom Broker — CIM Example Extractor
=======================================
Drop your best CIM PDFs into python/example_cims/
Run this script to extract their text and save to Supabase.

The extracted text gets appended to the Claude system prompt
so every new CIM learns from your best examples.

Usage:
  python python/extract_cim_examples.py

Requirements:
  pip install pdfplumber supabase python-dotenv --break-system-packages
"""

import os
import json
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

EXAMPLES_DIR = Path(__file__).parent / "example_cims"
OUTPUT_FILE  = Path(__file__).parent / "cim_examples_extracted.json"


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract clean text from a CIM PDF."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text.strip())
        full_text = "\n\n".join(text_parts)
        # Clean up whitespace
        lines = [line.strip() for line in full_text.split('\n') if line.strip()]
        return "\n".join(lines)
    except ImportError:
        print("  pdfplumber not installed. Run: pip install pdfplumber --break-system-packages")
        return ""
    except Exception as e:
        print(f"  Error reading {pdf_path.name}: {e}")
        return ""


def process_all_examples():
    """Process all PDFs in the example_cims folder."""
    if not EXAMPLES_DIR.exists():
        EXAMPLES_DIR.mkdir(parents=True)
        print(f"Created folder: {EXAMPLES_DIR}")
        print("Drop your best CIM PDF examples into this folder, then run this script again.")
        return []

    pdf_files = list(EXAMPLES_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {EXAMPLES_DIR}")
        print("Add your best CIM examples as PDF files and run again.")
        return []

    print(f"Found {len(pdf_files)} CIM example(s) to process...\n")
    results = []

    for pdf_path in sorted(pdf_files):
        print(f"Processing: {pdf_path.name}")
        text = extract_text_from_pdf(pdf_path)
        if text:
            word_count = len(text.split())
            print(f"  Extracted {word_count:,} words")
            results.append({
                "filename": pdf_path.name,
                "extracted_text": text,
                "word_count": word_count,
                "processed_at": datetime.now().isoformat()
            })
        else:
            print(f"  Could not extract text from {pdf_path.name}")

    return results


def save_to_json(results):
    """Save extracted text to a JSON file for use in the platform."""
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved to: {OUTPUT_FILE}")


def save_to_supabase(results):
    """Optionally save to Supabase cim_examples table."""
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("\nSupabase credentials not found — skipping Supabase upload.")
        print("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
        return

    try:
        from supabase import create_client
        client = create_client(supabase_url, supabase_key)

        for result in results:
            client.table("cim_examples").upsert({
                "filename": result["filename"],
                "extracted_text": result["extracted_text"],
                "word_count": result["word_count"],
                "processed_at": result["processed_at"]
            }, on_conflict="filename").execute()
            print(f"  Uploaded to Supabase: {result['filename']}")

    except ImportError:
        print("supabase package not installed. Run: pip install supabase --break-system-packages")
    except Exception as e:
        print(f"Supabase error: {e}")


def build_training_prompt_section(results) -> str:
    """Build the training section to append to the CIM system prompt."""
    if not results:
        return ""

    lines = [
        "",
        "════════════════════════════════════════════════════════════",
        "EXAMPLE CIMS — LEARN FROM THESE",
        "Study the structure, depth, tone, and quality of these",
        "real CIMs. Match or exceed their standard in every CIM",
        "you generate for Kingdom Broker sellers.",
        "════════════════════════════════════════════════════════════",
        ""
    ]

    for i, result in enumerate(results, 1):
        lines.append(f"--- EXAMPLE CIM {i}: {result['filename']} ---")
        # Truncate to first 3000 words to fit in context
        words = result['extracted_text'].split()
        if len(words) > 3000:
            truncated = ' '.join(words[:3000])
            lines.append(truncated)
            lines.append(f"[... truncated for context — full document: {len(words):,} words]")
        else:
            lines.append(result['extracted_text'])
        lines.append("")

    return "\n".join(lines)


def main():
    print("=" * 60)
    print("Kingdom Broker — CIM Example Processor")
    print("=" * 60)
    print()

    results = process_all_examples()

    if results:
        save_to_json(results)
        save_to_supabase(results)

        # Show the training section that will be added to the prompt
        training_section = build_training_prompt_section(results)
        preview_path = Path(__file__).parent / "cim_training_preview.txt"
        with open(preview_path, 'w') as f:
            f.write(training_section)
        print(f"\nTraining prompt section preview saved to: {preview_path}")

        print("\n" + "=" * 60)
        print("NEXT STEPS:")
        print("=" * 60)
        print()
        print("1. In lib/cim-prompt.ts, import the extracted examples:")
        print("   import examples from '../python/cim_examples_extracted.json'")
        print()
        print("2. Append to your system prompt:")
        print("   const prompt = CIM_SYSTEM_PROMPT + buildTrainingSection(examples)")
        print()
        print("3. The more quality CIMs you add to python/example_cims/,")
        print("   the better every generated CIM will be.")
        print()
        print(f"Processed {len(results)} CIM example(s) successfully.")
    else:
        print("\nAdd PDF files to python/example_cims/ and run again.")


if __name__ == "__main__":
    main()
