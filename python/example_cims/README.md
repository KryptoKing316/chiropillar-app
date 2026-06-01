# Example CIMs — AI Training Folder

Drop your best Confidential Information Memorandum PDFs here.

The AI reads these as reference material when generating new CIMs
for Kingdom Broker clients. The more quality examples you add,
the better the AI matches your standards for depth, narrative,
and professional presentation.

## How to use

1. Add any PDF CIM (real or anonymized) to this folder
2. Run the extraction script to pull text:

```bash
cd python
python3 extract_cim_text.py
```

3. The script saves extracted text to Supabase `cim_examples` table
4. The CIM Builder API automatically uses these examples when generating

## Quality over quantity

10 excellent CIMs is better than 50 mediocre ones.
The AI learns tone, structure, narrative framing, and data presentation
from whatever you add here.

Recommended: Add examples from real $2M–$20M deals across:
- HVAC / mechanical contractors
- Specialty manufacturing
- Dental / medical practices
- Roofing / specialty contracting
- Waste management

## Privacy note

Anonymize any real CIMs before adding (replace business names,
owner names, and addresses with generic placeholders).
This folder is local only and not committed to git.
