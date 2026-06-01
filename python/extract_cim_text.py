#!/usr/bin/env python3
"""
extract_cim_text.py
Extracts text from CIM PDFs in the example_cims/ folder
and saves them to Supabase for AI training.

Usage:
  cd python
  python3 extract_cim_text.py

Requirements:
  pip install pdfplumber supabase python-dotenv
"""

import os
import sys
import json
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Install pdfplumber: pip install pdfplumber")
    sys.exit(1)

try:
    from supabase import create_client
    from dotenv import load_dotenv
    load_dotenv('../.env.local')
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("Note: supabase/dotenv not installed. Text will be printed only.")
    print("Install with: pip install supabase python-dotenv\n")


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF file."""
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n\n".join(text_parts)


def main():
    examples_dir = Path(__file__).parent / "example_cims"
    pdf_files = list(examples_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in {examples_dir}")
        print("Add your best CIM PDFs to python/example_cims/ and run again.")
        return

    print(f"Found {len(pdf_files)} PDF(s) in example_cims/\n")

    supabase = None
    if HAS_SUPABASE:
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            supabase = create_client(url, key)
            print("Connected to Supabase\n")
        else:
            print("Warning: SUPABASE_URL or SERVICE_ROLE_KEY not set. Printing only.\n")

    results = []
    for pdf_path in pdf_files:
        print(f"Extracting: {pdf_path.name}...")
        try:
            text = extract_text_from_pdf(pdf_path)
            word_count = len(text.split())
            print(f"  ✓ {word_count:,} words extracted")

            record = {
                "filename": pdf_path.name,
                "extracted_text": text,
            }

            if supabase:
                # Upsert by filename
                result = supabase.table("cim_examples").upsert(
                    record,
                    on_conflict="filename"
                ).execute()
                if result.data:
                    print(f"  ✓ Saved to Supabase cim_examples table")
                else:
                    print(f"  ✗ Supabase error: {result}")
            else:
                # Save locally as JSON for manual inspection
                out_path = pdf_path.with_suffix(".extracted.json")
                with open(out_path, "w") as f:
                    json.dump(record, f, indent=2)
                print(f"  ✓ Saved to {out_path.name}")

            results.append({"file": pdf_path.name, "words": word_count, "success": True})

        except Exception as e:
            print(f"  ✗ Error: {e}")
            results.append({"file": pdf_path.name, "error": str(e), "success": False})

    print(f"\n{'='*50}")
    print(f"Done: {sum(1 for r in results if r['success'])}/{len(results)} files processed")
    print("The CIM Builder AI will now reference these examples when generating CIMs.")


if __name__ == "__main__":
    main()
