"""
Kingdom Broker · SearchFunder Co-Worker Agent
=============================================
Claude-powered helper for daily SearchFunder work. Five modes:

  draft-post     Generate 3 SF post drafts in Eric's voice on a given topic
  draft-dm       Generate personalized first-touch DMs from a member CSV
  draft-comment  Draft a helpful comment for a SF thread (paste the thread)
  enrich-member  Research a member's firm/background → outreach angle
  crm-sync       Push a reviewed-and-approved CSV into Supabase exchange_buyers

Voice rules baked in (no dashes, no em-dash, no AI tells, specific numbers).

Usage:
  python sf_agent.py draft-post --topic "HVAC valuation multiples Q1 2026"
  python sf_agent.py draft-dm --csv exports/2026-05-12_family_offices.csv
  python sf_agent.py draft-comment --thread thread.txt
  python sf_agent.py enrich-member --name "Jane Smith" --firm "Acme Capital"
  python sf_agent.py crm-sync exports/2026-05-12_reviewed.csv

Env:
  ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import os, sys, csv, json, argparse
from pathlib import Path
from anthropic import Anthropic
from dotenv import load_dotenv

here = Path(__file__).resolve().parent
load_dotenv(here.parent.parent / ".env.local")

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_KEY:
    print("✗ ANTHROPIC_API_KEY not set")
    sys.exit(1)

client = Anthropic(api_key=ANTHROPIC_KEY)
MODEL = "claude-sonnet-4-6"

# ─── Voice profile (baked into every prompt) ───────────────────────────

VOICE = """You write as Eric Skeldon, founder of Kingdom Broker — an AI-native
M&A advisor for $1-20M trade businesses (HVAC, plumbing, roofing, manufacturing,
landscaping, pool, etc.). Eric had 3 exits (freight brokerage, PE fund, B2B
sticker co) and currently runs Kingdom Warriors + Kingdom Broker.

VOICE RULES — non-negotiable:
- NEVER use em-dashes (—). Only allowed in number ranges: $1M-$20M, 7-10%
- NEVER use these AI tells: "Here's the deal", "Let me break it down",
  "Bottom line", "At the end of the day", "leveraging", "synergies",
  "optimize", "frictionless", "Hey there", "Hope this finds you well"
- Short sentences. 8-15 words. Plain English.
- Lead with the punchline, then explain.
- Specific numbers always > round numbers ($4.2M not "around $4M").
- Use proper nouns (AC Unlimited, Meriton, Voyage Acquisitions, Kingdom Broker).
- Sign with "Eric" only. No corporate signoff bloat.
- No emojis except 📊 🎯 ⚡ if data-related and used sparingly.
- Boomer-friendly. Blue-collar credible. No MBA jargon.

KB POSITIONING (drop these naturally when relevant):
- 1,127+ buyer database (family offices, PE, search funds, strategics)
- AI valuation engine: NAICS-keyed multiples across 25 industries, ~60 sec
- 6-agent sourcing pipeline (Claude + Apollo + Serper)
- 3 exits as deal-doer, not just an advisor
- Kingdom Broker Exchange = deal-sharing rails for top US brokers
- Free valuation tool: kingdombroker.com/valuation (THE lead magnet)
"""

# ─── Mode: draft-post ───────────────────────────────────────────────────

def draft_post(topic: str, count: int = 3):
    sys_p = VOICE + """

TASK: Draft SearchFunder post variations on the given topic.

Each post must:
- Be 80-180 words
- Open with a specific number or punchy claim
- Include at least ONE concrete artifact: a prompt, framework, screenshot
  description, or specific data point
- End with the free valuation link OR an open question that invites DMs
- Follow the templates in knowledge/searchfunder/playbook.md §Appendix

Output as JSON only:
{
  "variations": [
    {"angle": "data-driven", "title": "...", "body": "..."},
    {"angle": "case study", "title": "...", "body": "..."},
    {"angle": "controversial", "title": "...", "body": "..."}
  ]
}"""

    msg = f"Draft {count} SearchFunder posts on this topic: {topic}\n\nReturn JSON only."
    resp = client.messages.create(
        model=MODEL, max_tokens=3000, system=sys_p,
        messages=[{"role": "user", "content": msg}],
    )
    raw = "".join(b.text for b in resp.content if b.type == "text")
    raw = raw.strip().replace("```json", "").replace("```", "").strip()
    data = json.loads(raw)

    print("\n" + "=" * 70)
    print(f"SF POST DRAFTS · {topic}")
    print("=" * 70)
    for i, v in enumerate(data["variations"], 1):
        print(f"\n[{i}] ANGLE: {v['angle']}")
        print(f"TITLE: {v['title']}")
        print("-" * 60)
        print(v["body"])
        print("-" * 60)

    # Save draft
    drafts_dir = here.parent.parent.parent / "knowledge" / "searchfunder" / "drafts"
    drafts_dir.mkdir(parents=True, exist_ok=True)
    slug = topic.lower().replace(" ", "_")[:50]
    fp = drafts_dir / f"draft_{slug}.md"
    fp.write_text(f"# {topic}\n\n" + "\n\n---\n\n".join(
        f"## [{v['angle']}] {v['title']}\n\n{v['body']}" for v in data["variations"]
    ))
    print(f"\n✓ Saved to {fp.relative_to(here.parent.parent.parent)}")

# ─── Mode: draft-dm ─────────────────────────────────────────────────────

def draft_dm(csv_path: str):
    sys_p = VOICE + """

TASK: Draft a first-touch DM to a SearchFunder member.

DM rules:
- 50-90 words MAX. Shorter > longer.
- Reference ONE specific thing from their profile (search criteria, firm
  thesis, recent post, geography). Show you actually read it.
- Lead with the reference, not with introducing yourself.
- Offer ONE specific piece of value: a deal, a tool, a data point.
- End with a low-friction CTA: "worth a look?" or "happy to send."
- NEVER pitch the KB Coalition or Concierge in the first DM.
- NEVER mention their job title condescendingly.

Output JSON only: {"dm": "string", "angle": "one sentence why this DM works"}"""

    if not Path(csv_path).exists():
        print(f"✗ CSV not found: {csv_path}")
        return

    rows = list(csv.DictReader(open(csv_path)))
    out_path = Path(csv_path).with_name(Path(csv_path).stem + "_with_dms.csv")
    fieldnames = list(rows[0].keys()) + ["dm_draft", "dm_angle"]

    with open(out_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for i, r in enumerate(rows, 1):
            member_blurb = "\n".join(f"{k}: {v}" for k, v in r.items() if v)
            resp = client.messages.create(
                model=MODEL, max_tokens=800, system=sys_p,
                messages=[{"role": "user", "content": f"Draft a DM for this member:\n\n{member_blurb}"}],
            )
            raw = "".join(b.text for b in resp.content if b.type == "text").strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            try:
                data = json.loads(raw)
                r["dm_draft"] = data.get("dm", "")
                r["dm_angle"] = data.get("angle", "")
            except json.JSONDecodeError:
                r["dm_draft"] = raw
                r["dm_angle"] = "(parse error)"
            w.writerow(r)
            print(f"  [{i}/{len(rows)}] {r.get('firm_name', r.get('Name', '?'))}")

    print(f"\n✓ Wrote {len(rows)} DMs → {out_path}")
    print("Review the CSV, edit any drafts, then send manually or via MCP.")

# ─── Mode: draft-comment ────────────────────────────────────────────────

def draft_comment(thread_path: str):
    sys_p = VOICE + """

TASK: Draft a helpful comment on a SearchFunder thread.

Comment rules:
- 30-80 words
- Answer their actual question with substance. No platitudes.
- If you reference a KB asset (valuation tool, prompt, case study) it must
  directly relate to what they asked. No forced plugs.
- If you have a contrarian take, lead with the contrarian point.
- End with one question that opens dialogue.

Output JSON: {"comment": "string", "why_this_works": "one sentence"}"""

    thread_text = Path(thread_path).read_text()
    resp = client.messages.create(
        model=MODEL, max_tokens=600, system=sys_p,
        messages=[{"role": "user", "content": f"Thread:\n\n{thread_text}\n\nDraft a helpful comment."}],
    )
    raw = "".join(b.text for b in resp.content if b.type == "text").strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(raw)
    print("\n" + "=" * 70)
    print("DRAFT COMMENT")
    print("=" * 70)
    print(data["comment"])
    print("\nWHY: " + data["why_this_works"])

# ─── Mode: enrich-member ────────────────────────────────────────────────

def enrich_member(name: str, firm: str):
    sys_p = VOICE + """

TASK: Research a SearchFunder member + propose the best outreach angle for KB.

Output JSON:
{
  "firm_thesis": "one sentence on their investment thesis",
  "likely_search_criteria": ["industry", "geography", "check size", "etc"],
  "fit_score_1_10": 7,
  "fit_reason": "why this score",
  "best_outreach_angle": "the single best opening hook for Eric",
  "kb_assets_to_share": ["valuation tool", "specific case study", "specific deal"],
  "red_flags": ["any reasons to skip this member"]
}

If you don't know the firm, say so honestly. Don't fabricate."""

    msg = f"Member: {name}\nFirm: {firm}\n\nResearch + propose KB outreach angle."
    resp = client.messages.create(
        model=MODEL, max_tokens=1200, system=sys_p,
        messages=[{"role": "user", "content": msg}],
    )
    raw = "".join(b.text for b in resp.content if b.type == "text").strip()
    raw = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(raw)
    print("\n" + "=" * 70)
    print(f"MEMBER RESEARCH · {name} @ {firm}")
    print("=" * 70)
    print(json.dumps(data, indent=2))

# ─── Mode: crm-sync ─────────────────────────────────────────────────────

def crm_sync(csv_path: str):
    """Push approved/reviewed members from CSV → Supabase exchange_buyers."""
    try:
        from supabase import create_client
    except ImportError:
        print("✗ pip install supabase first")
        return

    sb_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (sb_url and sb_key):
        print("✗ Supabase env vars missing")
        return
    sb = create_client(sb_url, sb_key)

    rows = list(csv.DictReader(open(csv_path)))
    print(f"Syncing {len(rows)} rows from {csv_path} → exchange_buyers...")

    records = []
    for r in rows:
        rec = {
            "firm_name": r.get("firm_name") or r.get("Firm") or r.get("firm"),
            "contact_name": r.get("contact_name") or r.get("Name") or r.get("name"),
            "contact_email": (r.get("contact_email") or r.get("Email") or "").lower() or None,
            "contact_linkedin": r.get("linkedin") or r.get("LinkedIn") or r.get("profile_url"),
            "buyer_type": r.get("buyer_type") or r.get("Type") or "family_office",
            "hq_city": r.get("hq_city") or r.get("City"),
            "hq_state": r.get("hq_state") or r.get("State"),
            "industries": [s.strip() for s in (r.get("industries", "") or "").split(",") if s.strip()] or None,
            "notes": " | ".join(filter(None, [
                f"SF fit: {r.get('fit_score_1_10', '?')}/10" if r.get("fit_score_1_10") else None,
                r.get("notes"),
                r.get("dm_draft") and f"DM draft: {r['dm_draft'][:200]}",
            ])) or None,
            "source_tab": "SearchFunder",
            "is_active": True,
        }
        if rec["firm_name"]:
            records.append(rec)

    BATCH = 50
    inserted = 0
    for i in range(0, len(records), BATCH):
        batch = records[i:i + BATCH]
        try:
            sb.table("exchange_buyers").insert(batch).execute()
            inserted += len(batch)
            print(f"  ✓ {inserted}/{len(records)}")
        except Exception as e:
            print(f"  ✗ Batch {i} failed: {e}")
    print(f"\n✓ Synced {inserted} buyers to exchange_buyers (source: SearchFunder)")

# ─── CLI ────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(prog="sf_agent")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_post = sub.add_parser("draft-post", help="Draft 3 SF posts on a topic")
    p_post.add_argument("--topic", required=True)
    p_post.add_argument("--count", type=int, default=3)

    p_dm = sub.add_parser("draft-dm", help="Draft personalized DMs from a CSV")
    p_dm.add_argument("--csv", required=True)

    p_c = sub.add_parser("draft-comment", help="Draft a helpful comment on a thread")
    p_c.add_argument("--thread", required=True, help="Path to .txt with the thread content")

    p_e = sub.add_parser("enrich-member", help="Research a member + outreach angle")
    p_e.add_argument("--name", required=True)
    p_e.add_argument("--firm", required=True)

    p_s = sub.add_parser("crm-sync", help="Push reviewed CSV → exchange_buyers")
    p_s.add_argument("csv")

    args = ap.parse_args()
    if args.cmd == "draft-post":     draft_post(args.topic, args.count)
    elif args.cmd == "draft-dm":      draft_dm(args.csv)
    elif args.cmd == "draft-comment": draft_comment(args.thread)
    elif args.cmd == "enrich-member": enrich_member(args.name, args.firm)
    elif args.cmd == "crm-sync":      crm_sync(args.csv)

if __name__ == "__main__":
    main()
