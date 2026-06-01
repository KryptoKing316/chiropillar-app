import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { createTemplateFromPdf, createSubmission } from '@/lib/docuseal'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/exchange/deals/[id]/sign
 *
 * Upload a custom PDF (LOI, Purchase Agreement, or any custom doc) and send
 * it via DocuSeal for signature. Each firm brings their own templates.
 *
 * multipart/form-data:
 *   pdf:                File (the document to be signed)
 *   document_type:      'loi' | 'purchase_agreement' | 'custom'
 *   document_name:      "LOI · ACME Holdings buying TX HVAC"
 *   counterparty_name:  string
 *   counterparty_email: string
 *   counterparty_role:  e.g. 'Buyer' | 'Seller' (free-form)
 *   message?:           optional custom email body
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  // Resolve member + firm
  let memberRow: { id: string; firm_id: string; first_name: string; last_name: string; email: string } | null = null
  const { data: m } = await admin
    .from('coalition_members')
    .select('id, firm_id, first_name, last_name, email')
    .eq('user_id', session.user.id)
    .single()
  memberRow = m as typeof memberRow

  if (!memberRow && isAdmin) {
    const { data: kbFirm } = await admin.from('coalition_firms').select('id').eq('slug', 'kingdom-broker').single()
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
      memberRow = ericMember
    }
  }

  if (!memberRow) return NextResponse.json({ error: 'Not an Exchange member' }, { status: 403 })

  // Verify the deal exists + access
  const { data: deal } = await admin
    .from('coalition_deals')
    .select('id, source_firm_id, public_title')
    .eq('id', dealId)
    .single()
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  // Only source firm members can send sign requests on the deal
  const isSourceFirm = memberRow.firm_id === deal.source_firm_id || isAdmin
  if (!isSourceFirm) {
    return NextResponse.json({ error: 'Only the source firm can send sign requests on this deal' }, { status: 403 })
  }

  // Parse multipart
  const fd = await req.formData()
  const docType = String(fd.get('document_type') || '').toLowerCase()
  const docName = String(fd.get('document_name') || '').trim()
  const cpName = String(fd.get('counterparty_name') || '').trim()
  const cpEmail = String(fd.get('counterparty_email') || '').trim().toLowerCase()
  const cpRole = String(fd.get('counterparty_role') || 'Counterparty').trim()
  const customMessage = fd.get('message') ? String(fd.get('message')).trim() : null
  const pdfFile = fd.get('pdf') as File | null

  if (!['loi', 'purchase_agreement', 'custom'].includes(docType)) {
    return NextResponse.json({ error: 'document_type must be loi | purchase_agreement | custom' }, { status: 400 })
  }
  if (!docName) return NextResponse.json({ error: 'document_name required' }, { status: 400 })
  if (!cpName || !cpEmail.includes('@')) return NextResponse.json({ error: 'counterparty_name + valid email required' }, { status: 400 })
  if (!pdfFile || pdfFile.size === 0) return NextResponse.json({ error: 'pdf file required' }, { status: 400 })
  if (pdfFile.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'PDF over 25 MB' }, { status: 413 })

  // Upload PDF to Supabase Storage (reuse coalition-cim bucket — generic doc storage)
  const buf = Buffer.from(await pdfFile.arrayBuffer())
  const path = `exchange-signatures/${dealId}/${docType}-${Date.now()}.pdf`
  const { error: uploadErr } = await admin.storage
    .from('coalition-cim')
    .upload(path, buf, { contentType: 'application/pdf', upsert: false })
  if (uploadErr) {
    return NextResponse.json({ error: 'PDF upload failed: ' + uploadErr.message }, { status: 500 })
  }

  // Create DocuSeal template from the uploaded PDF (one-off per signature)
  const base64Pdf = buf.toString('base64')
  let template
  try {
    template = await createTemplateFromPdf({
      name: docName,
      pdf_base64: base64Pdf,
    })
  } catch (e) {
    return NextResponse.json({ error: 'DocuSeal template creation failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }

  // Create DocuSeal submission with both signers
  let submission
  try {
    submission = await createSubmission({
      template_id: template.id,
      send_email: true,
      order: 'preserved',
      submitters: [
        {
          role: cpRole,
          name: cpName,
          email: cpEmail,
          send_email: true,
        },
        {
          role: 'Kingdom Broker Exchange Member',
          name: `${memberRow.first_name} ${memberRow.last_name}`,
          email: memberRow.email,
          send_email: true,
        },
      ],
      message: {
        subject: `${docName} · Signature Requested`,
        body: customMessage ||
          `Hi ${cpName.split(' ')[0]},\n\n${memberRow.first_name} ${memberRow.last_name} sent you ${docName} to sign on Kingdom Broker DealExchange.\n\nClick the link below to review and sign. Both parties receive a copy once both sign.\n\nKingdom Broker · DealExchange`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'DocuSeal submission failed: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }

  // Persist to exchange_signatures
  const { data: sig, error: insertErr } = await admin
    .from('exchange_signatures')
    .insert({
      deal_id: dealId,
      document_type: docType,
      document_name: docName,
      source_firm_id: memberRow.firm_id,
      source_member_id: memberRow.id,
      pdf_path: path,
      docuseal_template_id: template.id,
      docuseal_submission_id: submission.id,
      signers: submission.submitters.map(s => ({
        name: s.name,
        email: s.email,
        role: s.role,
        status: s.status,
      })),
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertErr) {
    return NextResponse.json({
      error: 'DocuSeal sent but DB log failed: ' + insertErr.message,
      docuseal_submission_id: submission.id,
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    signature_id: sig?.id,
    document_type: docType,
    document_name: docName,
    docuseal_submission_id: submission.id,
    submitters: submission.submitters.map(s => ({
      email: s.email,
      name: s.name,
      role: s.role,
      embed_src: s.embed_src,
      status: s.status,
    })),
  }, { status: 201 })
}
