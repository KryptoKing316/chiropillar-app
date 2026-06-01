// ---------------------------------------------------------------------------
// QuickBooks Online (QBO) — OAuth client + report fetchers
// ---------------------------------------------------------------------------
// Required env vars (set in .env.local — NEVER commit):
//   QBO_CLIENT_ID
//   QBO_CLIENT_SECRET
//   QBO_REDIRECT_URI    e.g. https://app.kingdombroker.com/api/qbo/callback
//   QBO_ENV             sandbox | production
//
// Reference: https://developer.intuit.com/app/developer/qbo/docs/develop
// We use intuit-oauth for OAuth 2.0 + a thin custom client for the
// Reports + Account APIs (lighter than node-quickbooks which is huge).
// ---------------------------------------------------------------------------

import "server-only";

// Lazy require so this file is safe to import on the client (server-only
// ensures it never bundles; the lazy require keeps types clean).
type IntuitOAuthClient = {
  authorizeUri(opts: { scope: string[]; state: string }): string;
  createToken(url: string): Promise<{
    token: {
      access_token: string;
      refresh_token: string;
      realmId: string;
      expires_in: number;
      x_refresh_token_expires_in: number;
    };
  }>;
  refresh(): Promise<{
    token: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  }>;
  setToken(token: Record<string, unknown>): void;
};

let cachedClient: IntuitOAuthClient | null = null;

export function getQboOAuthClient(): IntuitOAuthClient {
  if (cachedClient) return cachedClient;

  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;
  const redirectUri = process.env.QBO_REDIRECT_URI;
  const env = (process.env.QBO_ENV || "sandbox").toLowerCase();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "QBO not configured. Set QBO_CLIENT_ID, QBO_CLIENT_SECRET, QBO_REDIRECT_URI in .env.local"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OAuthClient = require("intuit-oauth");
  cachedClient = new OAuthClient({
    clientId,
    clientSecret,
    environment: env === "production" ? "production" : "sandbox",
    redirectUri,
  }) as IntuitOAuthClient;

  return cachedClient;
}

// Scopes — read-only access to accounting data
export const QBO_SCOPES = ["com.intuit.quickbooks.accounting"];

// Resolve API base URL per environment
export function getQboApiBase(): string {
  const env = (process.env.QBO_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

// ── Report fetchers ────────────────────────────────────────────────────────
// All reports return Intuit's "report row" structure — left as raw JSONB
// in the DB so the UI can format flexibly.

async function qboReportFetch(
  realmId: string,
  accessToken: string,
  report: "ProfitAndLoss" | "BalanceSheet",
  startDate: string,
  endDate: string
): Promise<unknown> {
  const url = `${getQboApiBase()}/v3/company/${realmId}/reports/${report}?start_date=${startDate}&end_date=${endDate}&accounting_method=Accrual&minorversion=70`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`QBO ${report} fetch failed: ${res.status}`);
  }
  return await res.json();
}

export async function fetchProfitAndLoss(
  realmId: string,
  accessToken: string,
  year: number
): Promise<unknown> {
  return qboReportFetch(
    realmId,
    accessToken,
    "ProfitAndLoss",
    `${year}-01-01`,
    `${year}-12-31`
  );
}

export async function fetchBalanceSheet(
  realmId: string,
  accessToken: string,
  year: number
): Promise<unknown> {
  return qboReportFetch(
    realmId,
    accessToken,
    "BalanceSheet",
    `${year}-01-01`,
    `${year}-12-31`
  );
}

// Chart of Accounts via the Query API
export async function fetchChartOfAccounts(
  realmId: string,
  accessToken: string
): Promise<unknown> {
  const query = encodeURIComponent("SELECT * FROM Account MAXRESULTS 1000");
  const url = `${getQboApiBase()}/v3/company/${realmId}/query?query=${query}&minorversion=70`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`QBO Account query failed: ${res.status}`);
  }
  return await res.json();
}

// Company info — shown on the connect success card
export async function fetchCompanyInfo(
  realmId: string,
  accessToken: string
): Promise<{ companyName?: string; legalName?: string } | null> {
  try {
    const url = `${getQboApiBase()}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      CompanyInfo?: { CompanyName?: string; LegalName?: string };
    };
    return {
      companyName: data.CompanyInfo?.CompanyName,
      legalName: data.CompanyInfo?.LegalName,
    };
  } catch {
    return null;
  }
}
