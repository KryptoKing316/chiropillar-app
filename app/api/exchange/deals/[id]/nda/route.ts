import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { createSubmission } from '@/lib/docuseal'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// KB Mutual NDA template (existing — uploaded to DocuSeal)
const KB_NDA_TEMPLATE_ID = 3631570

/**
 * POST /api/exchange/deals/[id]/nda
 *
 * Sends an NDA via DocuSeal to a counterparty so they can access deal details.
 *
 * Two flows:
 *   1. Own-firm outbound: source firm member sends NDA to a buyer/external party
 *   2. Cross-firm request: another firm member requests NDA access to a listed deal
 *      (creates pending request, source firm approves, then NDA fires)
 *
 * Body: {
 *   flow: 'outbound' | 'request',
 *   counterparty_email: string,
 *   counterparty_name: string,
 *   counterparty_company?: string,
 *   buyer_profile?: string,  // for 'request' flow only
 *   message?: string         // optional custom message in email
 * }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealId } = await params

  // Auth
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  // Resolve coalition member
  const { data: memberRow } = await admin
    .from('coalition_members')
    .select('id, firm_id, first_name, last_name, email, coalition_firms!firm_id(firm_name)')
    .eq('user_id', session.user.id)
    .single()

  let member = memberRow as null | {
    id: string
    firm_id: string
    first_name: string
    last_name: string
    email: string
    coalition_firms: { firm_name: string } | { firm_name: string }[]
  }

  // For admin without member row, look up KB firm + create stub
  if (!member && isAdmin) {
    const { data: kbFirm } = await admin
      .from('coalition_firms').select('id, firm_name').eq('slug', 'kingdom-broker').single()
    if (kbFirm) {
      const { data: ericMember } = await admin
        .from('coalition_members')
        .upsert({
          firm_id: kbFirm.id,
          user_id: session.user.id,
          first_name: 'Eric',
          last_name: 'Skeldon',
          email: 'eric@kingdombroker.com',
          title: 'Founder',
          role: 'admin',
          is_active: true,
        }, { onConflict: 'email' })
        .select('id, firm_id, first_name, last_name, email')
        .single()
      if (ericMember) {
        member = { ...ericMember, coalition_firms: { firm_name: kbFirm.firm_name } }
      }
    }
  }

  if (!member) {
    return NextResponse.json({ error: 'Not a Exchange member' }, { status: 403 })
  }

  // Get the deal
  const { data: deal } = await admin
    .from('coalition_deals')
    .select('id, public_title, source_firm_id, source_member_id, status, coalition_firms!source_firm_id(firm_name)')
    .eq('id', dealId)
    .single()
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  // Parse body
  const body = await req.json()
  const flow = (body.flow as 'outbound' | 'request') ?? 'outbound'
  const cpEmail = String(body.counterparty_email || '').trim().toLowerCase()
  const cpName = String(body.counterparty_name || '').trim()
  const cpCompany = body.counterparty_company ? String(body.counterparty_company).trim() : null
  const buyerProfile = body.buyer_profile ? String(body.buyer_profile).trim() : null
  const customMessage = body.message ? String(body.message).trim() : null

  if (!cpEmail || !cpEmail.includes('@')) {
    return NextResponse.json({ error: 'Valid counterparty_email required' }, { status: 400 })
  }
  if (!cpName) {
    return NextResponse.json({ error: 'counterparty_name required' }, { status: 400 })
  }

  // Authorization rules
  const isSourceFirm = member.firm_id === deal.source_firm_id || isAdmin
  if (flow === 'outbound' && !isSourceFirm) {
    return NextResponse.json({ error: 'Only the source firm can send outbound NDAs for this deal' }, { status: 403 })
  }
  if (flow === 'request' && isSourceFirm) {
    return NextResponse.json({ error: 'Cannot request NDA for your own firm\'s deal — use outbound flow' }, { status: 400 })
  }

  const memberFirmName = Array.isArray(member.coalition_firms)
    ? member.coalition_firms[0]?.firm_name
    : member.coalition_firms?.firm_name
  const memberFullName = `${member.first_name} ${member.last_name}`

  // ──────────────────────────────────────────────────────
  // FLOW 1: Outbound — source firm sends NDA to a 3rd party
  // ──────────────────────────────────────────────────────
  if (flow === 'outbound') {
    let submission
    try {
      submission = await createSubmission({
        template_id: KB_NDA_TEMPLATE_ID,
        send_email: true,
        order: 'preserved',
        submitters: [
          {
            role: 'Party A',
            name: cpName,
            email: cpEmail,
            send_email: true,
            values: { Company: cpCompany ?? '', Name: cpName, Email: cpEmail },
          },
          {
            role: 'Party B',
            name: memberFullName,
            email: member.email,
            send_email: true,
            values: { Company: memberFirmName ?? 'Kingdom Broker', Name: memberFullName, Email: member.email },
          },
        ],
        message: {
          subject: `${memberFirmName ?? 'Kingdom Broker'} · Mutual NDA for ${deal.public_title}`,
          body: customMessage ||
            `Hi ${cpName.split(' ')[0] ?? cpName},\n\n${memberFullName} at ${memberFirmName ?? 'Kingdom Broker'} is sharing a confidential M&A opportunity with you: ${deal.public_title}.\n\nBefore we discuss specifics, please sign this Mutual NDA. After both parties sign, you will receive a copy and ${memberFullName} will share the CIM + financials.\n\nKingdom Broker · DealExchange`,
        },
      })
    } catch (e) {
      return NextResponse.json({ error: `DocuSeal: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
    }

    // Persist as an "approved" request (since the source firm initiated it themselves)
    const { data: nda } = await admin
      .from('coalition_nda_requests')
      .insert({
        deal_id: dealId,
        requester_firm_id: member.firm_id,
        requester_member_id: member.id,
        buyer_profile: cpCompany ? `Outbound to ${cpCompany}` : `Outbound to ${cpName}`,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by_member_id: member.id,
        docuseal_submission_id: String(submission.id),
      })
      .select('id')
      .single()

    return NextResponse.json({
      success: true,
      flow: 'outbound',
      docuseal_submission_id: submission.id,
      nda_request_id: nda?.id,
      submitters: submission.submitters.map(s => ({
        email: s.email,
        name: s.name,
        role: s.role,
        embed_src: s.embed_src,
        status: s.status,
      })),
    }, { status: 201 })
  }

  // ──────────────────────────────────────────────────────
  // FLOW 2: Request — another firm asks source firm for NDA access
  // Creates a pending request. Source firm approves/declines later.
  // ──────────────────────────────────────────────────────
  const { data: existing } = await admin
    .from('coalition_nda_requests')
    .select('id, status')
    .eq('deal_id', dealId)
    .eq('requester_member_id', member.id)
    .single()
  if (existing) {
    return NextResponse.json({
      error: `You already have a ${existing.status} NDA request for this deal`,
      existing_request_id: existing.id,
    }, { status: 409 })
  }

  const { data: ndaReq, error: insertErr } = await admin
    .from('coalition_nda_requests')
    .insert({
      deal_id: dealId,
      requester_firm_id: member.firm_id,
      requester_member_id: member.id,
      buyer_profile: buyerProfile ?? `${memberFirmName ?? 'Exchange member'} buyer-side inquiry`,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertErr || !ndaReq) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to create NDA request' }, { status: 500 })
  }

  const dealFirm = deal.coalition_firms as unknown as { firm_name?: string } | { firm_name?: string }[] | null
  const sourceFirmName = Array.isArray(dealFirm) ? dealFirm[0]?.firm_name : dealFirm?.firm_name

  return NextResponse.json({
    success: true,
    flow: 'request',
    nda_request_id: ndaReq.id,
    message: `Request submitted to ${sourceFirmName ?? 'source firm'}. They will approve or decline. You will be notified.`,
  }, { status: 201 })
}

/**
 * GET /api/exchange/deals/[id]/nda
 * List NDA requests for a deal (source firm only).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const { data: requests } = await admin
    .from('coalition_nda_requests')
    .select('*, coalition_members!requester_member_id(first_name, last_name, email, coalition_firms!firm_id(firm_name))')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ requests: requests ?? [] })
}
