// ---------------------------------------------------------------------------
// Input Sanitization
// All user-supplied strings pass through here before being stored or rendered.
// We use the Supabase client for all DB writes (parameterized — no SQL injection risk),
// but we still sanitize to prevent XSS and data integrity issues.
// ---------------------------------------------------------------------------

// Strip HTML tags and dangerous characters from a string
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";

  return input
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Encode angle brackets to prevent XSS if ever rendered as HTML
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Trim
    .trim()
    // Limit length to 10,000 chars for text fields
    .slice(0, 10_000);
}

// Sanitize an email address
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim().toLowerCase().slice(0, 320);
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "";
  return trimmed;
}

// Sanitize a numeric value — returns null if not a valid number
export function sanitizeNumber(input: unknown): number | null {
  const n = Number(input);
  if (!isFinite(n) || isNaN(n)) return null;
  return n;
}

// Sanitize an integer
export function sanitizeInt(input: unknown, min?: number, max?: number): number | null {
  const n = sanitizeNumber(input);
  if (n === null) return null;
  const i = Math.floor(n);
  if (min !== undefined && i < min) return null;
  if (max !== undefined && i > max) return null;
  return i;
}

// Sanitize a string to only contain alphanumeric characters + common symbols
// Use for names, business names, etc.
export function sanitizeName(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 255);
}

// Sanitize a US state code (2 uppercase letters)
export function sanitizeStateCode(input: unknown): string {
  if (typeof input !== "string") return "";
  const upper = input.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  return upper;
}

// Sanitize a UUID (v4 format)
export function sanitizeUuid(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(trimmed)) {
    return "";
  }
  return trimmed;
}

// Sanitize a full request body object — apply text sanitization to all string fields
export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (typeof value === "number") {
      result[key] = sanitizeNumber(value) ?? 0;
    } else if (Array.isArray(value)) {
      result[key] = value.map(v => (typeof v === "string" ? sanitizeText(v) : v));
    } else {
      result[key] = value;
    }
  }
  return result;
}
