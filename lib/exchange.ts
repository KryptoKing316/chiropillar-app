// ════════════════════════════════════════════════════════════════
// Kingdom Broker — DealExchange Coalition helpers + types
// ════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

// ─── TYPES ──────────────────────────────────────────────────────

export type CoalitionTier = "founder" | "affiliate" | "self_serve";
export type FirmStatus = "invited" | "active" | "paused" | "terminated";
export type DealStatus = "draft" | "listed" | "matched" | "loi" | "closed" | "withdrawn";
export type NdaStatus = "pending" | "approved" | "declined" | "expired";

export interface CoalitionFirm {
  id: string;
  slug: string;
  firm_name: string;
  legal_name?: string;
  hq_city?: string;
  hq_state?: string;
  website?: string;
  logo_url?: string;
  brand_primary: string;
  brand_accent: string;
  tier: CoalitionTier;
  equity_pct: number;
  finder_fee_pct: number;
  status: FirmStatus;
  signed_date?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CoalitionMember {
  id: string;
  firm_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  role: "broker" | "admin" | "viewer";
  is_active: boolean;
  created_at: string;
}

export interface CoalitionDeal {
  id: string;
  source_firm_id: string;
  source_member_id: string;
  // Public/anonymized
  public_title: string;
  public_summary?: string;
  industry?: string;
  city_region?: string;
  state?: string;
  revenue_band?: string;
  ebitda_band?: string;
  asking_price_band?: string;
  years_in_business?: number;
  team_size_band?: string;
  // Private (NDA-locked)
  private_business_name?: string;
  private_address?: string;
  private_owner_name?: string;
  private_full_financials?: Record<string, unknown>;
  cim_pdf_path?: string;
  // AI valuation
  ai_valuation_low?: number;
  ai_valuation_mid?: number;
  ai_valuation_high?: number;
  ai_naics_code?: string;
  ai_multiple_low?: number;
  ai_multiple_high?: number;
  ai_valuation_notes?: string;
  // Status
  status: DealStatus;
  listed_at?: string;
  closed_at?: string;
  closed_price?: number;
  buyer_firm_id?: string;
  buyer_member_id?: string;
  created_at: string;
  updated_at: string;
}

// ─── HELPERS ────────────────────────────────────────────────────

/**
 * Get the Coalition member record for a given auth user.
 * Returns null if user is not a coalition member.
 */
export async function getExchangeMember(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from("coalition_members")
    .select("*, coalition_firms!inner(*)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as CoalitionMember & { coalition_firms: CoalitionFirm };
}

/**
 * Get all Coalition deals visible to a member (anonymized fields only,
 * unless they have an approved NDA).
 */
export async function listVisibleDeals(_memberId: string, options?: {
  industry?: string;
  state?: string;
  status?: DealStatus[];
  limit?: number;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let query = supabase
    .from("coalition_deals")
    .select("id, source_firm_id, public_title, public_summary, industry, city_region, state, revenue_band, ebitda_band, asking_price_band, years_in_business, team_size_band, ai_valuation_low, ai_valuation_mid, ai_valuation_high, status, listed_at, created_at, coalition_firms!source_firm_id(firm_name, logo_url, brand_primary)")
    .in("status", options?.status ?? ["listed", "matched"])
    .order("listed_at", { ascending: false, nullsFirst: false })
    .limit(options?.limit ?? 50);

  if (options?.industry) query = query.eq("industry", options.industry);
  if (options?.state) query = query.eq("state", options.state);

  const { data } = await query;
  return data ?? [];
}

/**
 * Check if a member has approved NDA access to a deal's private fields.
 */
export async function hasApprovedNda(memberId: string, dealId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data } = await supabase
    .from("coalition_nda_requests")
    .select("id")
    .eq("deal_id", dealId)
    .eq("requester_member_id", memberId)
    .eq("status", "approved")
    .single();

  return !!data;
}

/**
 * Get a firm's branding (for white-label theming).
 */
export function getFirmBranding(firm: CoalitionFirm) {
  return {
    name: firm.firm_name,
    logoUrl: firm.logo_url ?? "/kb-logo-dark.png",
    primaryColor: firm.brand_primary,
    accentColor: firm.brand_accent,
  };
}

/**
 * Format a revenue/ebitda/price band for display.
 */
export function formatBand(band?: string): string {
  if (!band) return "—";
  return band.replace(/\$/g, "$");
}

/**
 * Industry-keyed cover photo URLs (Unsplash, commercial-use OK).
 * Use `w=640&q=80` Unsplash params for card display.
 */
export const INDUSTRY_COVER_PHOTOS: Record<string, string> = {
  hvac:           "https://kingdombroker.com/HVAC%20WORKING%20ON%20JOB.webp",
  plumbing:       "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=640&q=80",
  electrical:     "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&q=80",
  roofing:        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=640&q=80",
  manufacturing:  "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=640&q=80",
  machining:      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=640&q=80",
  construction:   "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=640&q=80",
  auto:           "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=640&q=80",
  pool:           "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&q=80",
  landscaping:    "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=640&q=80",
  dental:         "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=640&q=80",
  medical:        "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=640&q=80",
  veterinary:     "https://images.unsplash.com/photo-1583511666445-775f1f2116f5?w=640&q=80",
  food:           "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640&q=80",
  environmental:  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80",
  cleaning:       "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=640&q=80",
  pest:           "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&q=80",
  default:        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&q=80",
};

/**
 * Return a deterministic cover photo URL based on industry string.
 */
export function getCoverPhoto(industry?: string): string {
  if (!industry) return INDUSTRY_COVER_PHOTOS.default;
  const i = industry.toLowerCase();
  if (i.includes('hvac')) return INDUSTRY_COVER_PHOTOS.hvac;
  if (i.includes('plumb')) return INDUSTRY_COVER_PHOTOS.plumbing;
  if (i.includes('electric')) return INDUSTRY_COVER_PHOTOS.electrical;
  if (i.includes('roof')) return INDUSTRY_COVER_PHOTOS.roofing;
  if (i.includes('cnc') || i.includes('machin')) return INDUSTRY_COVER_PHOTOS.machining;
  if (i.includes('manufactur') || i.includes('fab')) return INDUSTRY_COVER_PHOTOS.manufacturing;
  if (i.includes('construct')) return INDUSTRY_COVER_PHOTOS.construction;
  if (i.includes('auto')) return INDUSTRY_COVER_PHOTOS.auto;
  if (i.includes('pool')) return INDUSTRY_COVER_PHOTOS.pool;
  if (i.includes('landscap')) return INDUSTRY_COVER_PHOTOS.landscaping;
  if (i.includes('dental')) return INDUSTRY_COVER_PHOTOS.dental;
  if (i.includes('medical') || i.includes('health')) return INDUSTRY_COVER_PHOTOS.medical;
  if (i.includes('vet')) return INDUSTRY_COVER_PHOTOS.veterinary;
  if (i.includes('food') || i.includes('cold chain')) return INDUSTRY_COVER_PHOTOS.food;
  if (i.includes('environment') || i.includes('asbestos')) return INDUSTRY_COVER_PHOTOS.environmental;
  if (i.includes('clean')) return INDUSTRY_COVER_PHOTOS.cleaning;
  if (i.includes('pest')) return INDUSTRY_COVER_PHOTOS.pest;
  return INDUSTRY_COVER_PHOTOS.default;
}

/**
 * Hero cover photo for the /exchange dashboard page.
 * A confident industrial / cityscape image that works on navy.
 */
export const EXCHANGE_HERO_COVER = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85";
