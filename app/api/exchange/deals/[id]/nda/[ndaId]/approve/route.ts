import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { createSubmission } from '@/lib/docuseal'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

const KB_NDA_TEMPLATE_ID = 3631570

/**
 * POST /api/exchange/deals/[id]/nda/[ndaId]/approve
 * Body: { action: 'approve' | 'decline', reason?: string }
 *
 * Source-firm member approves or declines an incoming NDA request from another firm.
 * On approve: fires the actual DocuSeal NDA between requester + source firm.
 * On decline: marks status=declined with reason.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; ndaId: string }> }) {
  const { id: dealId, ndaId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  // Get the source-firm member (the approver)
  const { data: approverMember } = await admin
    .from('coalition_members')
    .select('id, firm_id, first_name, last_name, email')
    .eq('user_id', session.user.id)
    .single()

  if (!approverMember && !isAdmin) {
    return NextResponse.json({ error: 'Not an Exchange member' }, { status: 403 })
  }

  // Verify deal + approver is source firm
  const { data: deal } = await admin
    .from('coalition_deals')
    .select('id, source_firm_id, public_title')
    .eq('id', dealId)
    .single()
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const isSourceFirm = approverMember?.firm_id === deal.source_firm_id || isAdmin
  if (!isSourceFirm) return NextResponse.json({ error: 'Only source firm can approve/decline NDAs' }, { status: 403 })

  // Get the NDA request
  const { data: ndaReq } = await admin
    .from('coalition_nda_requests')
    .select('id, status, requester_member_id, requester_firm_id, buyer_profile')
    .eq('id', ndaId)
    .eq('deal_id', dealId)
    .single()

  if (!ndaReq) return NextResponse.json({ error: 'NDA request not found' }, { status: 404 })
  if (ndaReq.status !== 'pending') {
    return NextResponse.json({ error: `Request already ${ndaReq.status}` }, { status: 400 })
  }

  // Parse body
  const body = await req.json()
  const action = String(body.action || '').toLowerCase()
  const reason = body.reason ? String(body.reason).trim() : null

  // ─── DECLINE ──────────────────────────────────────────────
  if (action === 'decline') {
    await admin
      .from('coalition_nda_requests')
      .update({
        status: 'declined',
        declined_reason: reason ?? 'No reason given',
      })
      .eq('id', ndaId)
    return NextResponse.json({ success: true, action: 'declined' })
  }

  // ─── APPROVE ──────────────────────────────────────────────
  if (action !== 'approve') {
    return NextResponse.json({ error: "action must be 'approve' or 'decline'" }, { status: 400 })
  }

  // Get requester info for DocuSeal
  const { data: requesterMember } = await admin
    .from('coalition_members')
    .select('first_name, last_name, email, coalition_firms!firm_id(firm_name)')
    .eq('id', ndaReq.requester_member_id)
    .single()

  if (!requesterMember) {
    return NextResponse.json({ error: 'Requester member not found' }, { status: 404 })
  }

  const requesterFirmRel = requesterMember.coalition_firms as { firm_name?: string } | { firm_name?: string }[] | null
  const requesterFirmName = Array.isArray(requesterFirmRel)
    ? requesterFirmRel[0]?.firm_name
    : requesterFirmRel?.firm_name

  // Get approver's firm name
  const approverName = approverMember
    ? `${approverMember.first_name} ${approverMember.last_name}`
    : 'Eric Skeldon'
  const approverEmail = approverMember?.email ?? 'eric@kingdombroker.com'

  // Fire the actual NDA via DocuSeal
  let submission
  try {
    submission = await createSubmission({
      template_id: KB_NDA_TEMPLATE_ID,
      send_email: true,
      order: 'preserved',
      submitters: [
        {
          role: 'Party A',
          name: `${requesterMember.first_name} ${requesterMember.last_name}`,
          email: requesterMember.email,
          send_email: true,
          values: {
            Company: requesterFirmName ?? '',
            Name: `${requesterMember.first_name} ${requesterMember.last_name}`,
            Email: requesterMember.email,
          },
        },
        {
          role: 'Party B',
          name: approverName,
          email: approverEmail,
          send_email: true,
          values: {
            Company: 'Kingdom Broker Exchange · Source Firm',
            Name: approverName,
            Email: approverEmail,
          },
        },
      ],
      message: {
        subject: `NDA Approved · ${deal.public_title}`,
        body: `Hi ${requesterMember.first_name},\n\n${approverName} approved your NDA request for "${deal.public_title}" on Kingdom Broker DealExchange.\n\nSign this Mutual NDA below. After both parties sign, full deal details (business name, CIM, financials) unlock for ${requesterFirmName ?? 'your firm'}.\n\nKingdom Broker · DealExchange`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'DocuSeal failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }

  // Update NDA request to approved + attach DocuSeal submission
  await admin
    .from('coalition_nda_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by_member_id: approverMember?.id ?? null,
      docuseal_submission_id: String(submission.id),
    })
    .eq('id', ndaId)

  return NextResponse.json({
    success: true,
    action: 'approved',
    docuseal_submission_id: submission.id,
    submitters: submission.submitters.map(s => ({
      email: s.email,
      name: s.name,
      role: s.role,
      status: s.status,
    })),
  })
}
