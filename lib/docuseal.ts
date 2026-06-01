// DocuSeal API client wrapper
// Works for both DocuSeal Cloud (api.docuseal.com) and self-hosted instances.
// Set DOCUSEAL_API_URL + DOCUSEAL_API_KEY in env.

const DEFAULT_BASE_URL = 'https://api.docuseal.com'

function baseUrl(): string {
  return (process.env.DOCUSEAL_API_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
}

function apiKey(): string {
  const k = process.env.DOCUSEAL_API_KEY
  if (!k) throw new Error('DOCUSEAL_API_KEY not set in env')
  return k
}

async function ds<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'X-Auth-Token': apiKey(),
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DocuSeal ${res.status} on ${path}: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

// ──────────────────────────────────────────────────────────────────
// Templates
// ──────────────────────────────────────────────────────────────────

export type DocuSealTemplate = {
  id: number
  slug: string
  name: string
  fields: Array<{ name: string; type: string; required?: boolean }>
  schema: unknown
  created_at: string
}

export async function listTemplates(): Promise<DocuSealTemplate[]> {
  const data = await ds<{ data: DocuSealTemplate[] }>('/templates')
  return data.data || []
}

export async function getTemplate(id: number): Promise<DocuSealTemplate> {
  return ds<DocuSealTemplate>(`/templates/${id}`)
}

// Create a template by uploading a PDF (base64 or URL)
export async function createTemplateFromPdf(args: {
  name: string
  pdf_url?: string
  pdf_base64?: string
  fields?: Array<{ name: string; type: string; submitter_role?: string }>
}): Promise<DocuSealTemplate> {
  const body: Record<string, unknown> = {
    name: args.name,
    documents: args.pdf_url
      ? [{ url: args.pdf_url }]
      : [{ name: args.name, file: args.pdf_base64 }],
  }
  if (args.fields) body.fields = args.fields
  return ds<DocuSealTemplate>('/templates/pdf', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ──────────────────────────────────────────────────────────────────
// Submissions (the actual signing requests sent to recipients)
// ──────────────────────────────────────────────────────────────────

export type DocuSealSubmitter = {
  email: string
  name?: string
  role?: string
  values?: Record<string, string>
  send_email?: boolean
  send_sms?: boolean
  phone?: string
}

export type DocuSealSubmission = {
  id: number
  source: string
  submitters_order: 'random' | 'preserved'
  status: 'pending' | 'completed' | 'declined' | 'expired'
  submitters: Array<{
    id: number
    email: string
    name?: string
    role?: string
    status: 'awaiting' | 'opened' | 'completed' | 'declined'
    completed_at?: string
    embed_src?: string  // URL to embed iframe for in-app signing
  }>
  audit_log_url?: string
  combined_document_url?: string
  created_at: string
  completed_at?: string
}

export async function createSubmission(args: {
  template_id: number
  submitters: DocuSealSubmitter[]
  send_email?: boolean
  order?: 'random' | 'preserved'
  message?: { subject?: string; body?: string }
  expires_at?: string
}): Promise<DocuSealSubmission> {
  return ds<DocuSealSubmission>('/submissions', {
    method: 'POST',
    body: JSON.stringify({
      template_id: args.template_id,
      send_email: args.send_email ?? true,
      submitters_order: args.order ?? 'preserved',
      submitters: args.submitters,
      ...(args.message ? { message: args.message } : {}),
      ...(args.expires_at ? { expires_at: args.expires_at } : {}),
    }),
  })
}

export async function getSubmission(id: number | string): Promise<DocuSealSubmission> {
  return ds<DocuSealSubmission>(`/submissions/${id}`)
}

export async function listSubmissions(args?: {
  template_id?: number
  status?: 'pending' | 'completed' | 'declined' | 'expired'
}): Promise<DocuSealSubmission[]> {
  const qs = new URLSearchParams()
  if (args?.template_id) qs.set('template_id', String(args.template_id))
  if (args?.status) qs.set('status', args.status)
  const path = qs.toString() ? `/submissions?${qs}` : '/submissions'
  const data = await ds<{ data: DocuSealSubmission[] }>(path)
  return data.data || []
}

export async function archiveSubmission(id: number | string): Promise<{ archived: true }> {
  return ds<{ archived: true }>(`/submissions/${id}`, { method: 'DELETE' })
}

// ──────────────────────────────────────────────────────────────────
// Webhook signature verification
// ──────────────────────────────────────────────────────────────────

// DocuSeal sends webhook payloads on submission.completed, submission.declined, etc.
// Verify the signature header to ensure it's authentic.
export function verifyWebhook(_payload: string, _signature: string | null): boolean {
  // DocuSeal Cloud uses HMAC-SHA256 with DOCUSEAL_WEBHOOK_SECRET
  // Self-hosted: configurable. For Phase 1 we accept all webhooks; Phase 2 adds signing.
  // TODO: implement signature verification once we have a webhook secret configured
  return true
}
