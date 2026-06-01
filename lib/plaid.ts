// ---------------------------------------------------------------------------
// Plaid Server Client — Transactions + Balances (24 months)
// ---------------------------------------------------------------------------
// Required env vars (set in .env.local — NEVER commit):
//   PLAID_CLIENT_ID
//   PLAID_SECRET_SANDBOX      (only required when PLAID_ENV=sandbox)
//   PLAID_SECRET_DEVELOPMENT  (only required when PLAID_ENV=development)
//   PLAID_SECRET_PRODUCTION   (only required when PLAID_ENV=production)
//   PLAID_ENV                 sandbox | development | production
//
// Reference: https://plaid.com/docs/api/
// ---------------------------------------------------------------------------

import "server-only";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

type PlaidEnv = "sandbox" | "development" | "production";

function resolveEnv(): PlaidEnv {
  const v = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (v === "production" || v === "development") return v;
  return "sandbox";
}

function resolveSecret(env: PlaidEnv): string | undefined {
  switch (env) {
    case "production":
      return process.env.PLAID_SECRET_PRODUCTION;
    case "development":
      return process.env.PLAID_SECRET_DEVELOPMENT;
    default:
      return process.env.PLAID_SECRET_SANDBOX;
  }
}

let cachedClient: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (cachedClient) return cachedClient;

  const env = resolveEnv();
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = resolveSecret(env);

  if (!clientId || !secret) {
    throw new Error(
      `Plaid not configured. Set PLAID_CLIENT_ID and PLAID_SECRET_${env.toUpperCase()} in .env.local`
    );
  }

  const config = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": secret,
      },
    },
  });

  cachedClient = new PlaidApi(config);
  return cachedClient;
}

// Trades-business transaction categorization rules — used by the
// categorization agent after a fetch. Each rule is a regex match against the
// merchant_name OR name field, plus an inferred KB category and an
// add-back-candidate flag.
//
// This is the static rules layer. The Claude trades-categorizer agent
// (lib/agents/trades-categorizer.ts — built later) handles the long tail.
export interface TradesRule {
  pattern: RegExp;
  kbCategory: string;
  isAddBackCandidate: boolean;
  addBackReason: string;
}

export const TRADES_CATEGORIZATION_RULES: TradesRule[] = [
  // ── Materials suppliers (COGS, NOT add-back) ────────────────────────────
  {
    pattern: /home depot|lowe'?s|ferguson|grainger|white cap|hd supply/i,
    kbCategory: "COGS_materials",
    isAddBackCandidate: false,
    addBackReason: "",
  },
  {
    pattern: /supply house|reece|plumb master|carrier|trane|johnstone supply/i,
    kbCategory: "COGS_materials",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Subcontractor labor (COGS) ──────────────────────────────────────────
  {
    pattern: /subcontract|1099 labor|temp labor/i,
    kbCategory: "COGS_labor",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Work vehicles (CAPEX + potential add-back if owner-personal) ───────
  {
    pattern: /ford|chevrolet|chevy|gmc|ram trucks|dodge ram|toyota/i,
    kbCategory: "equipment",
    isAddBackCandidate: true,
    addBackReason:
      "Possible work-truck purchase — confirm if business or personal use",
  },
  {
    pattern: /caterpillar|cat machinery|kubota|john deere|bobcat/i,
    kbCategory: "equipment",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Equipment / capex ───────────────────────────────────────────────────
  {
    pattern: /compressor|generator|forklift|lift|crane|welder/i,
    kbCategory: "equipment",
    isAddBackCandidate: true,
    addBackReason: "Equipment purchase — likely one-time capex",
  },

  // ── Owner draws (almost always add-back) ────────────────────────────────
  {
    pattern: /owner draw|owners? draw|ownerdraw/i,
    kbCategory: "owner_draw",
    isAddBackCandidate: true,
    addBackReason: "Owner draw — normalize to market salary for valuation",
  },

  // ── Personal entertainment (likely add-back) ────────────────────────────
  {
    pattern: /country club|golf|yacht|boat|marina|tennis club/i,
    kbCategory: "one_time",
    isAddBackCandidate: true,
    addBackReason: "Personal entertainment — likely add-back",
  },
  {
    pattern: /casino|wynn|caesars|mgm|bellagio/i,
    kbCategory: "one_time",
    isAddBackCandidate: true,
    addBackReason: "Entertainment — likely add-back",
  },

  // ── Rent / utilities ────────────────────────────────────────────────────
  {
    pattern: /rent|lease payment/i,
    kbCategory: "rent",
    isAddBackCandidate: false,
    addBackReason: "",
  },
  {
    pattern: /electric|atmos|gas company|water dept|trash|sewer/i,
    kbCategory: "utilities",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Phone / comms ───────────────────────────────────────────────────────
  {
    pattern: /at&?t|verizon|t.?mobile|spectrum|comcast|google fiber/i,
    kbCategory: "phone",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Marketing / lead-gen ────────────────────────────────────────────────
  {
    pattern: /google ads|facebook ads|meta ads|yelp|angi|home advisor|service titan/i,
    kbCategory: "marketing",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Insurance ───────────────────────────────────────────────────────────
  {
    pattern: /insurance|workers comp|general liability|state farm|allstate|geico/i,
    kbCategory: "insurance",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Professional fees ───────────────────────────────────────────────────
  {
    pattern: /cpa|accountant|attorney|legal|law firm|bookkeeper/i,
    kbCategory: "professional_fees",
    isAddBackCandidate: false,
    addBackReason: "",
  },

  // ── Payroll service ─────────────────────────────────────────────────────
  {
    pattern: /adp|gusto|paychex|quickbooks payroll|paycor/i,
    kbCategory: "payroll",
    isAddBackCandidate: false,
    addBackReason: "",
  },
];

// Apply trades rules to a single transaction. Returns null if no rule matches.
// (The Claude agent should be the fallback for unmatched.)
export function applyTradesRules(
  transactionName: string,
  merchantName: string | null
): { kbCategory: string; isAddBackCandidate: boolean; addBackReason: string } | null {
  const haystack = `${merchantName || ""} ${transactionName || ""}`;
  for (const rule of TRADES_CATEGORIZATION_RULES) {
    if (rule.pattern.test(haystack)) {
      return {
        kbCategory: rule.kbCategory,
        isAddBackCandidate: rule.isAddBackCandidate,
        addBackReason: rule.addBackReason,
      };
    }
  }
  return null;
}
