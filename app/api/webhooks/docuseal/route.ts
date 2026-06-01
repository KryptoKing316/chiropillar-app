import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase'
import { verifyWebhook } from '@/lib/docuseal'

// POST /api/webhooks/docuseal
// DocuSeal calls this whenever a submission state changes:
//   submission.created · submission.opened · submission.completed
//   submission.declined · submission.expired
//
// Configure this URL in DocuSeal Cloud:
//   Settings → Webhooks → Add: https://app.kingdombroker.com/api/webhooks/docuseal
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const sig = req.headers.get('x-docuseal-signature')

  if (!verifyWebhook(raw, sig)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let payload: {
    event_type?: string
    timestamp?: string
    data?: {
      id?: number
      status?: string
      submitters?: Array<{
        email?: string
        name?: string
        role?: string
        status?: string
        completed_at?: string
      }>
      audit_log_url?: string
      combined_document_url?: string
      completed_at?: string
    }
  }
  try { payload = JSON.parse(raw) } catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }) }

  const submissionId = payload.data?.id
  if (!submissionId) return NextResponse.json({ ok: true, skipped: 'no submission id' })

  const admin = getAdminSupabase()

  // Find the matching signature_request row
  const { data: row } = await admin
    .from('signature_requests')
    .select('id, client_id, document_name')
    .eq('docuseal_submission_id', String(submissionId))
    .single()

  if (!row) return NextResponse.json({ ok: true, skipped: 'no matching request' })

  // Map DocuSeal status to our status enum
  const map: Record<string, string> = {
    'submission.created':   'sent',
    'submission.opened':    'in_progress',
    'submission.completed': 'completed',
    'submission.declined':  'declined',
    'submission.expired':   'expired',
  }
  const newStatus = map[payload.event_type ?? ''] ?? 'in_progress'

  const update: Record<string, unknown> = {
    status: newStatus,
    signers: payload.data?.submitters?.map(s => ({
      name: s.name,
      email: s.email,
      role: s.role,
      status: s.status,
      signed_at: s.completed_at ?? null,
    })),
    updated_at: new Date().toISOString(),
  }
  if (newStatus === 'completed') {
    update.completed_at = payload.data?.completed_at ?? new Date().toISOString()
    update.docuseal_audit_url = payload.data?.audit_log_url ?? null
  }

  await admin.from('signature_requests').update(update).eq('id', row.id)

  // Activity log entry
  const event = payload.event_type ?? 'updated'
  let verb = 'updated'
  let activityType = 'doc'
  if (event === 'submission.completed') { verb = 'fully signed'; activityType = 'milestone' }
  else if (event === 'submission.opened') { verb = 'opened' }
  else if (event === 'submission.declined') { verb = 'declined'; activityType = 'milestone' }
  else if (event === 'submission.expired') { verb = 'let expire'; activityType = 'doc' }

  await admin.from('client_activity_log').insert({
    client_id: row.client_id,
    who: 'DocuSeal',
    verb,
    what: row.document_name,
    activity_type: activityType,
  })

  return NextResponse.json({ ok: true, updated: row.id, status: newStatus })
}
