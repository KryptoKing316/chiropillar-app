"""
Kingdom Broker — Buyer Database Migration
=========================================
Reads the 1,127+ buyer master book from Google Sheets and inserts into
Supabase `exchange_buyers` for the DealExchange AI matching engine.

Tabs scanned (whichever exist, name-matched loosely):
  🏦 All Buyers
  🏛 Family Offices
  💼 PE / VC / JV Club
  🏗 Strategic Acquirers
  💼 Buyers
  Any tab whose name contains: buyer, family office, pe, vc, strategic, acquirer

Heuristics:
  - Header row is row 1
  - Column names recognized (case-insensitive): firm/firm name/company,
    name/contact, email, phone, linkedin, type/buyer type, city, state,
    check size min/max, deal size min/max, industries, geography,
    ebitda min/max, notes

Run from project root:
  cd kingdom-broker
  source ../venv/bin/activate    # or wherever your python env lives
  python3 scripts/migrate_buyers_to_supabase.py [--dry-run] [--limit N]

Env required:
  GOOGLE_SHEETS_ID, GOOGLE_CREDENTIALS_JSON (path),
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import os, sys, re, json, argparse
from pathlib import Path
import gspread
from google.oauth2.service_account import Credentials
from supabase import create_client
from dotenv import load_dotenv

# Look up .env.local from the kingdom-broker dir (next to this script's parent)
here = Path(__file__).resolve().parent
load_dotenv(here.parent / ".env.local")
load_dotenv(here.parent.parent / ".env")  # repo-root fallback

SHEETS_ID = os.getenv("GOOGLE_SHEETS_ID")
CREDS_PATH = os.getenv("GOOGLE_CREDENTIALS_JSON", "google_credentials.json")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not (SHEETS_ID and SUPABASE_URL and SUPABASE_KEY):
    print("❌ Missing env vars: GOOGLE_SHEETS_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Resolve creds path
if not Path(CREDS_PATH).exists():
    for candidate in [here.parent / "google_credentials.json", here.parent.parent / "google_credentials.json", here.parent.parent / "python" / "google_credentials.json"]:
        if candidate.exists():
            CREDS_PATH = str(candidate)
            break

scopes = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]
creds = Credentials.from_service_account_file(CREDS_PATH, scopes=scopes)
gc = gspread.authorize(creds)
sh = gc.open_by_key(SHEETS_ID)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"✅ Connected to Sheet '{sh.title}' + Supabase")

# ─── Parse helpers ────────────────────────────────────────────────────────────

BUYER_TAB_HINTS = ["buyer", "family office", "pe ", "/ pe", "vc", "search fund", "strategic", "acquirer", "investor"]

def is_buyer_tab(name: str) -> bool:
    n = name.lower()
    return any(h in n for h in BUYER_TAB_HINTS)

def norm(s):
    if s is None: return None
    s = str(s).strip()
    return s if s else None

def parse_money(s):
    if not s: return None
    s = str(s).replace("$", "").replace(",", "").strip().lower()
    if not s or s in ("-", "n/a", "tbd"): return None
    m = re.match(r"^([\d.]+)\s*([kmb]?)$", s)
    if m:
        n = float(m.group(1))
        unit = m.group(2)
        if unit == "k": n *= 1_000
        elif unit == "m": n *= 1_000_000
        elif unit == "b": n *= 1_000_000_000
        return n
    try:
        return float(s)
    except ValueError:
        return None

def parse_range(s):
    """E.g. '$1M-$5M' → (1_000_000, 5_000_000)"""
    if not s: return (None, None)
    s = str(s).strip()
    parts = re.split(r"\s*[-–to]+\s*", s)
    if len(parts) == 2:
        return (parse_money(parts[0]), parse_money(parts[1]))
    return (parse_money(s), parse_money(s))

def parse_array(s):
    if not s: return []
    return [p.strip() for p in re.split(r"[,;|/]", str(s)) if p.strip()]

def buyer_type_norm(s):
    if not s: return None
    s = str(s).lower()
    if "family" in s: return "family_office"
    if "search" in s: return "search_fund"
    if "strategic" in s or "operator" in s: return "strategic"
    if "individual" in s or "self funded" in s: return "individual"
    if "pe" in s or "private equity" in s: return "pe"
    if "vc" in s or "venture" in s: return "vc"
    return s

# Map flexible header strings → canonical field name
HEADER_MAP = {
    "firm name": "firm_name", "firm": "firm_name", "company": "firm_name", "fund name": "firm_name",
    "contact": "contact_name", "name": "contact_name", "contact name": "contact_name",
    "top contact 1": "contact_name",
    "title": "title", "title 1": "title",
    "email": "contact_email", "contact email": "contact_email", "email 1": "contact_email",
    "phone": "contact_phone", "contact phone": "contact_phone",
    "linkedin": "contact_linkedin", "linkedin url": "contact_linkedin", "linkedin 1": "contact_linkedin",
    "type": "buyer_type", "buyer type": "buyer_type", "investor type": "buyer_type",
    "city": "hq_city", "hq city": "hq_city",
    "state": "hq_state", "hq state": "hq_state",
    "hq": "hq_location", "location": "hq_location", "hq location": "hq_location",
    "check size min": "check_size_min", "min check": "check_size_min",
    "check size max": "check_size_max", "max check": "check_size_max",
    "check size": "check_size_range",
    "aum / check size": "check_size_range", "aum/check size": "check_size_range",
    "scale / revenue": "scale_revenue", "scale/revenue": "scale_revenue",
    "deal size min": "deal_size_min",
    "deal size max": "deal_size_max",
    "deal size": "deal_size_range",
    "industries": "industries", "industry": "industries", "sectors": "industries", "focus": "industries",
    "geography": "geography", "geo": "geography", "region": "geography",
    "ebitda min": "ebitda_min", "ebitda max": "ebitda_max", "ebitda": "ebitda_range",
    "notes": "notes", "comments": "notes", "pitch angle / notes": "notes",
    "kb fit / score": "kb_fit_score", "kb pitch angle": "kb_pitch_angle",
    "strategic advantage to kb": "strategic_advantage",
    "website": "website", "source": "source_origin",
}

def split_hq(s):
    """Parse 'Austin, TX' / 'Dallas, Texas' → (city, state)"""
    if not s: return (None, None)
    parts = [p.strip() for p in str(s).split(",")]
    if len(parts) >= 2:
        return (parts[0] or None, parts[-1] or None)
    return (parts[0] or None, None)

def build_record(headers, row, tab_name, row_idx):
    rec = {"source_tab": tab_name, "source_row": row_idx, "is_active": True}
    extra_notes_parts = []  # Stash unmapped fields into the notes blob
    for i, h in enumerate(headers):
        if i >= len(row): break
        key = HEADER_MAP.get((h or "").strip().lower())
        if not key: continue
        val = norm(row[i])
        if val is None: continue
        if key == "check_size_range":
            lo, hi = parse_range(val); rec["check_size_min"] = lo; rec["check_size_max"] = hi
            if lo is None and hi is None:
                # Range didn't parse cleanly — keep as note
                extra_notes_parts.append(f"Check size: {val}")
        elif key == "deal_size_range":
            lo, hi = parse_range(val); rec["deal_size_min"] = lo; rec["deal_size_max"] = hi
        elif key == "ebitda_range":
            lo, hi = parse_range(val); rec["ebitda_min"] = lo; rec["ebitda_max"] = hi
        elif key in ("check_size_min", "check_size_max", "deal_size_min", "deal_size_max", "ebitda_min", "ebitda_max"):
            rec[key] = parse_money(val)
        elif key in ("industries", "geography"):
            rec[key] = parse_array(val)
        elif key == "buyer_type":
            rec[key] = buyer_type_norm(val)
        elif key == "contact_email":
            rec[key] = val.lower()
        elif key == "hq_location":
            city, state = split_hq(val)
            if city and not rec.get("hq_city"): rec["hq_city"] = city
            if state and not rec.get("hq_state"): rec["hq_state"] = state
        elif key == "scale_revenue":
            extra_notes_parts.append(f"Scale: {val}")
        elif key == "kb_fit_score":
            extra_notes_parts.append(f"KB Fit: {val}")
        elif key == "kb_pitch_angle":
            extra_notes_parts.append(f"Pitch angle: {val}")
        elif key == "strategic_advantage":
            extra_notes_parts.append(f"Strategic angle: {val}")
        elif key == "title":
            extra_notes_parts.append(f"Title: {val}")
        elif key == "website":
            extra_notes_parts.append(f"Web: {val}")
        elif key == "source_origin":
            extra_notes_parts.append(f"Source: {val}")
        elif key == "notes":
            extra_notes_parts.append(val)
        else:
            rec[key] = val
    # Merge collected extras into notes
    if extra_notes_parts:
        existing = rec.get("notes")
        rec["notes"] = " | ".join([existing] + extra_notes_parts) if existing else " | ".join(extra_notes_parts)
    return rec if rec.get("firm_name") else None

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Parse + count only, don't write")
    ap.add_argument("--limit", type=int, default=None, help="Cap total rows inserted")
    ap.add_argument("--wipe", action="store_true", help="Delete existing exchange_buyers before insert")
    args = ap.parse_args()

    if args.wipe and not args.dry_run:
        print("🗑  Wiping existing exchange_buyers...")
        supabase.table("exchange_buyers").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    all_records = []
    seen_emails = set()
    seen_firms = set()

    for ws in sh.worksheets():
        if not is_buyer_tab(ws.title):
            continue
        print(f"\n📋 Scanning tab: {ws.title}")
        rows = ws.get_all_values()
        if len(rows) < 2:
            print("   (empty or no headers)")
            continue
        headers = [h.strip().lower() for h in rows[0]]
        print(f"   Headers: {headers}")
        added_in_tab = 0
        for i, row in enumerate(rows[1:], start=2):
            rec = build_record(headers, row, ws.title, i)
            if not rec: continue
            email = rec.get("contact_email")
            firm = rec.get("firm_name", "").lower().strip()
            # Dedup on email > firm name
            if email and email in seen_emails: continue
            if not email and firm in seen_firms: continue
            if email: seen_emails.add(email)
            if firm: seen_firms.add(firm)
            all_records.append(rec)
            added_in_tab += 1
            if args.limit and len(all_records) >= args.limit:
                break
        print(f"   ✓ Parsed {added_in_tab} buyers from this tab")
        if args.limit and len(all_records) >= args.limit:
            break

    print(f"\n📊 Total unique buyers parsed: {len(all_records)}")

    if args.dry_run:
        print("\n🔍 DRY RUN — first 3 records:")
        for r in all_records[:3]:
            print(json.dumps(r, indent=2, default=str))
        print("\n(Use without --dry-run to insert)")
        return

    if not all_records:
        print("\n⚠️  Nothing to insert.")
        return

    print(f"\n⬆️  Inserting into exchange_buyers (batch of 100)...")
    inserted = 0
    BATCH = 100
    for i in range(0, len(all_records), BATCH):
        batch = all_records[i:i + BATCH]
        try:
            supabase.table("exchange_buyers").insert(batch).execute()
            inserted += len(batch)
            print(f"   ✓ {inserted}/{len(all_records)}")
        except Exception as e:
            print(f"   ✗ Batch starting at {i} failed: {e}")

    print(f"\n✅ Done. Inserted {inserted} buyers into exchange_buyers.")

if __name__ == "__main__":
    main()
