# Kingdom Broker — CIM Examples Folder

## How This Works

Drop your best CIM PDF examples into this folder.
They train the AI to match the quality and style you want.

## Steps

1. Add PDF files to this folder (example_cims/)
2. Run from your project root:
   ```
   python python/extract_cim_examples.py
   ```
3. The script extracts the text and saves it to:
   - python/cim_examples_extracted.json (local file)
   - Supabase cim_examples table (if credentials configured)
4. The platform automatically loads these examples into the
   Claude system prompt — so every new CIM learns from them

## What Makes a Good Training Example

Add CIMs that:
- Have strong executive summaries (clear value statement, specific metrics)
- Include a clean add-back / EBITDA normalization schedule
- Have well-written growth opportunities sections
- Cover a range of industries (HVAC, dental, manufacturing, etc.)
- Represent deals that actually closed or generated strong buyer interest

Avoid adding:
- CIMs with inflated numbers or unrealistic projections
- Documents with client names / confidential info you don't own rights to
- Low-quality or incomplete CIMs

## Target: 10 Great Examples

With 10 high-quality CIM examples in this folder, the AI output
will match the standard of top M&A advisory firms.
Every example you add improves every future CIM generated.

## File Naming Convention

Name your files descriptively so you know what industry each covers:
  hvac_texas_4m_closed.pdf
  dental_practice_austin_3m.pdf
  roofing_contractor_southeast_2m.pdf
  waste_management_florida_7m.pdf
  manufacturing_ohio_6m_closed.pdf

## Current Examples

(Add your PDF files here — folder is currently empty)
