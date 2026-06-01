import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { createSubmission, type DocuSealSubmitter } from '@/lib/docuseal'

// POST /api/portal/signatures
// Body: {
//   client_slug: string
//   document_name: string
//   document_type?: string ('msa'|'loi'|'nda'|'engagement'|'other')
//   template_id: number       (DocuSeal template ID — uploaded once via DocuSeal UI)
//   signers: [{ email, name, role? }]
//   message?: { subject?, body? }
// }
//
// Admin-only. Creates a DocuSeal submission, persists a signature_requests row,
// returns the submission + per-signer embed URLs for in-portal signing.
export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    client_slug?: string
    document_name?: string
    document_type?: string
    template_id?: number
    signers?: DocuSealSubmitter[]
    message?: { subject?: string; body?: string }
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { client_slug, document_name, document_type, template_id, signers, message } = body
  if (!client_slug || !document_name || !template_id || !signers || signers.length === 0) {
    return NextResponse.json({ error: 'client_slug, document_name, template_id, signers all required' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  // Look up client
  const { data: client } = await admin
    .from('clients')
    .select('id, business_name, owner_email')
    .eq('slug', client_slug)
    .single()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  // Create DocuSeal submission
  let submission
  try {
    submission = await createSubmission({
      template_id,
      submitters: signers,
      send_email: true,
      order: 'preserved',
      message,
    })
  } catch (e) {
    return NextResponse.json({ error: `DocuSeal: ${e instanceof Error ? e.message : 'failed'}` }, { status: 502 })
  }

  // Persist
  const { data: row, error: insertError } = await admin
    .from('signature_requests')
    .insert({
      client_id: client.id,
      docuseal_submission_id: String(submission.id),
      document_name,
      document_type: document_type ?? 'other',
      signers: submission.submitters.map(s => ({
        name: s.name,
        email: s.email,
        role: s.role,
        status: s.status,
        embed_src: s.embed_src,
      })),
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_by: user.email ?? 'admin',
    })
    .select()
    .single()
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Activity log
  await admin.from('client_activity_log').insert({
    client_id: client.id,
    who: user.email?.split('@')[0] === 'eric' ? 'Eric' : (user.email ?? 'KB Team'),
    verb: 'sent',
    what: `${document_name} for signature`,
    activity_type: 'doc',
  })

  return NextResponse.json({
    ok: true,
    submission_id: submission.id,
    signature_request: row,
    submitters: submission.submitters,  // includes embed_src per signer
  })
}

// GET /api/portal/signatures?client_slug=ac-unlimited
// Returns all signature_requests rows for a client (filtered by RLS).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const client_slug = searchParams.get('client_slug')
  if (!client_slug) return NextResponse.json({ error: 'client_slug required' }, { status: 400 })

  const admin = getAdminSupabase()
  const { data: client } = await admin.from('clients').select('id').eq('slug', client_slug).single()
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data: rows } = await admin
    .from('signature_requests')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ signature_requests: rows ?? [] })
}
