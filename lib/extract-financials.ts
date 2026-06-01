// ---------------------------------------------------------------------------
// Trades-Tuned Financial Document Extraction
// ---------------------------------------------------------------------------
// Calls Claude (Sonnet 4.6 for cost / Opus 4.7 for high-stakes deals) to
// extract structured financials from a PDF or image. Prompt is tuned for
// $1-20M trades-business M&A patterns (HVAC, plumbing, electrical, roofing,
// machine shops, light manufacturing).
//
// Returns null on any error — extraction failures must never crash the
// upload pipeline.
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";

export interface AddBack {
  description: string;
  amount: number;
  reason: string;
  confidence: number; // 1-10
}

export interface TradesFlag {
  flag: string;
  amount: number;
  investigate: string;
}

export interface ExtractedFinancials {
  gross_revenue: number | null;
  cost_of_goods_sold: number | null;
  gross_profit: number | null;
  total_operating_expenses: number | null;
  ebitda: number | null;
  net_income: number | null;
  owner_compensation_total: number | null;
  depreciation: number | null;
  amortization: number | null;
  interest_expense: number | null;
  one_time_items: Array<{ description: string; amount: number }>;
  suggested_add_backs: AddBack[];
  trades_specific_flags: TradesFlag[];
  confidence_score: number; // 1-10
  data_quality_notes: string;
  doc_type_detected: string;
  year_detected: number | null;
}

const TRADES_EXTRACTION_PROMPT = `You are a financial analyst specializing in $1-20M trades-business M&A valuation
(HVAC, plumbing, electrical, roofing, machine shops, light manufacturing).

Extract structured financials from this {{DOC_TYPE}} for year {{YEAR}}. Trades
businesses typically have these add-back patterns — flag any that appear:
- Work-truck purchases or depreciation (often $20K-$80K/year)
- Owner W-2 wages above market rate ($75K-$150K market for owner-operator)
- Family-member-on-payroll (spouse, adult children) without clear role
- Phantom rent on owner-leased shop space (owner pays himself rent)
- One-time equipment purchases (compressors, lifts, machinery)
- Personal vehicle expenses run through business
- Country-club, golf, or boat-related entertainment

Return ONLY valid JSON matching this exact shape (no markdown, no commentary):
{
  "gross_revenue": number | null,
  "cost_of_goods_sold": number | null,
  "gross_profit": number | null,
  "total_operating_expenses": number | null,
  "ebitda": number | null,
  "net_income": number | null,
  "owner_compensation_total": number | null,
  "depreciation": number | null,
  "amortization": number | null,
  "interest_expense": number | null,
  "one_time_items": [{"description": string, "amount": number}],
  "suggested_add_backs": [
    {"description": string, "amount": number, "reason": string, "confidence": 1-10}
  ],
  "trades_specific_flags": [
    {"flag": string, "amount": number, "investigate": string}
  ],
  "confidence_score": 1-10,
  "data_quality_notes": string,
  "doc_type_detected": "tax_return" | "pl_statement" | "bank_statements" | "balance_sheet" | "invoice" | "other",
  "year_detected": number | null
}

If a field cannot be determined, use null. Be aggressive on add-back
identification — trades sellers often miss $50K-$200K of legitimate
add-backs that raise valuation by 3-8x that amount.`;

function buildPrompt(docType: string, year: number): string {
  return TRADES_EXTRACTION_PROMPT
    .replace("{{DOC_TYPE}}", docType)
    .replace("{{YEAR}}", String(year));
}

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

// Extract from a PDF — assumes pdf-text has already been pulled
export async function extractFromPdfText(
  pdfText: string,
  docType: string,
  year: number
): Promise<ExtractedFinancials | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(docType, year) },
            { type: "text", text: `\n\nDocument text:\n${pdfText.slice(0, 80000)}` },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    return parseExtraction(content.text);
  } catch {
    return null;
  }
}

// Extract from an image (JPEG/PNG/HEIC) using Claude Vision
export async function extractFromImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  docType: string,
  year: number
): Promise<ExtractedFinancials | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            { type: "text", text: buildPrompt(docType, year) },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    return parseExtraction(content.text);
  } catch {
    return null;
  }
}

// Robust JSON parse — strips markdown fences if Claude wraps response
function parseExtraction(raw: string): ExtractedFinancials | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);

    // Minimal shape validation — must have at least the discriminator fields
    if (typeof parsed !== "object" || parsed === null) return null;
    if (!("doc_type_detected" in parsed)) return null;
    if (!("confidence_score" in parsed)) return null;

    return parsed as ExtractedFinancials;
  } catch {
    return null;
  }
}

// Auto-classify a filename + first-page-text into a doc_type slot
// Used by the folder-upload flow so sellers can drag a whole folder and we
// figure out where each file belongs.
export function classifyDocument(
  filename: string,
  firstPageText: string = ""
): { docType: string; year: number | null; confidence: number } {
  const lower = (filename + " " + firstPageText.slice(0, 500)).toLowerCase();

  // Year detection — find 4-digit year between 2018-2030
  let year: number | null = null;
  const yearMatches = lower.match(/\b(20[1-3][0-9])\b/g);
  if (yearMatches) {
    // Prefer the most recent year mentioned
    year = Math.max(...yearMatches.map((y) => parseInt(y, 10)));
  }

  // Doc-type classification by keyword scoring
  const scores: Record<string, number> = {
    tax_return: 0,
    pl_statement: 0,
    bank_statements: 0,
    balance_sheet: 0,
    ar_aging: 0,
    equipment_list: 0,
    lease_agreements: 0,
    customer_list: 0,
    employee_roster: 0,
    other: 1, // baseline
  };

  if (/tax|1120|1040|schedule\s*c|form\s*1040|form\s*1120|irs/.test(lower)) scores.tax_return += 5;
  if (/profit.{0,4}loss|p\s*&\s*l|income\s+statement/.test(lower)) scores.pl_statement += 5;
  if (/bank\s+statement|chase|wells|bofa|bank\s+of\s+america/.test(lower)) scores.bank_statements += 5;
  if (/balance\s+sheet/.test(lower)) scores.balance_sheet += 5;
  if (/a\/?r\s+aging|accounts\s+receivable\s+aging/.test(lower)) scores.ar_aging += 5;
  if (/equipment\s+list|fixed\s+asset/.test(lower)) scores.equipment_list += 4;
  if (/lease\s+agreement|rental\s+agreement/.test(lower)) scores.lease_agreements += 4;
  if (/customer\s+list|client\s+list/.test(lower)) scores.customer_list += 4;
  if (/employee\s+roster|payroll\s+roster|staff\s+list/.test(lower)) scores.employee_roster += 4;

  // Pick highest score
  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return {
    docType: top[0],
    year,
    confidence: Math.min(10, top[1] * 2),
  };
}
