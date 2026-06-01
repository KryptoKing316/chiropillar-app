import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { createEnvelope } from '@/lib/docusign'
import { TEMPLATES, renderTemplate } from '@/lib/loi-templates'
import type { TemplateType } from '@/lib/loi-templates'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

async function sendLOIEmail(to: string, toName: string, subject: string, body: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: 'Kingdom Broker <noreply@kingdombroker.com>',
      to,
      subject,
      html: body,
    })
  } catch (err) {
    console.error('[Resend] Email error:', err instanceof Error ? err.message : String(err))
  }
}

function buildEmailHtml(heading: string, message: string, ctaText: string, ctaUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0B1B3E;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#0F2347;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
    <div style="background:#0B1B3E;padding:28px 32px;border-bottom:1px solid rgba(201,168,76,0.2);">
      <div style="font-family:Georgia,serif;font-size:22px;color:#C9A84C;font-weight:700;">Kingdom Broker</div>
      <div style="font-size:12px;color:#9BA8C0;margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">Business Acquisition Advisory</div>
    </div>
    <div style="padding:32px;">
      <h2 style="font-family:Georgia,serif;color:#F2EEE7;font-size:20px;margin:0 0 16px;">${heading}</h2>
      <p style="color:#9BA8C0;font-size:15px;line-height:1.7;margin:0 0 28px;">${message}</p>
      <a href="${ctaUrl}" style="display:inline-block;background:#C9A84C;color:#0B1B3E;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">${ctaText}</a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);">
      <p style="color:#4A5880;font-size:13px;margin:0;">Eric Skeldon · Kingdom Broker · Eric@KingdomBroker.com · 469-494-9890</p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireSession(req)
  if (authError) return authError

  try {
    const body = await req.json() as { loi_id?: string }
    const { loi_id } = body

    if (!loi_id) {
      return NextResponse.json({ error: 'loi_id is required' }, { status: 400 })
    }

    const admin = getAdminSupabase()

    // Fetch the LOI with related deal info
    const { data: loi, error: loiError } = await admin
      .from('lois')
      .select('*')
      .eq('id', loi_id)
      .single()

    if (loiError || !loi) {
      return NextResponse.json({ error: 'LOI not found' }, { status: 404 })
    }

    // Get deal info
    const { data: deal } = await admin
      .from('deals')
      .select('business_name, seller_id')
      .eq('id', loi.deal_id)
      .single()

    // Get buyer profile
    const { data: buyer } = loi.buyer_id
      ? await admin.from('profiles').select('full_name,email,phone,company_name').eq('id', loi.buyer_id).single()
      : { data: null }

    // Get seller profile
    const { data: seller } = loi.seller_id
      ? await admin.from('profiles').select('full_name,email').eq('id', loi.seller_id).single()
      : { data: null }

    // Render LOI HTML from template + data
    const templateType = loi.template_type as TemplateType
    const template = TEMPLATES[templateType]
    if (!template) {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    const loiData = (loi.loi_data || {}) as Record<string, string>
    const loiHtml = renderTemplate(template, loiData)

    // Save rendered HTML
    await admin
      .from('lois')
      .update({ loi_html: loiHtml })
      .eq('id', loi_id)

    const buyerName = buyer?.full_name || loiData.buyer_name || 'Kingdom Broker'
    const buyerEmail = buyer?.email || loiData.buyer_email || 'Eric@KingdomBroker.com'
    const buyerClientUserId = loi.buyer_id || 'kingdom-broker'
    const sellerName = seller?.full_name || loiData.seller_name || 'Business Owner'
    const sellerEmail = seller?.email || loiData.seller_email || ''
    const sellerClientUserId = loi.seller_id || null
    const businessName = deal?.business_name || loiData.business_name || 'the business'

    // Try DocuSign — gracefully degrade if not configured
    const envelopeResult = await createEnvelope(
      loiHtml,
      buyerName,
      buyerEmail,
      buyerClientUserId,
      sellerName,
      sellerEmail,
      sellerClientUserId,
      businessName
    )

    const now = new Date().toISOString()

    if (envelopeResult.notConfigured) {
      // DocuSign not set up — mark as manual send, still update deal
      await admin.from('lois').update({
        status: 'sent_manual',
        sent_at: now,
        loi_html: loiHtml,
      }).eq('id', loi_id)

      await admin.from('deals').update({ status: 'loi' }).eq('id', loi.deal_id)

      await admin.from('activity_log').insert({
        deal_id: loi.deal_id,
        event_type: 'loi_sent_manual',
        event_description: `LOI created (${templateType.replace('_', ' ')}) — manual send (DocuSign not configured)`,
        metadata: { loi_id, amount: loiData.purchase_price },
      })

      // Still send Resend notification to buyer
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.kingdombroker.com'
      if (buyerEmail) {
        await sendLOIEmail(
          buyerEmail,
          buyerName,
          `Your LOI for ${businessName} is ready`,
          buildEmailHtml(
            `Your Letter of Intent is Ready`,
            `Your LOI for the acquisition of ${businessName} has been created. Please review it and share it with the seller for their signature.`,
            'View LOI',
            `${appUrl}/loi/${loi_id}`
          )
        )
      }

      return NextResponse.json({
        success: true,
        status: 'sent_manual',
        message: 'LOI saved. DocuSign is not configured — please send the LOI manually.',
        notConfigured: true,
      })
    }

    if (!envelopeResult.success) {
      return NextResponse.json({ error: envelopeResult.error || 'DocuSign error' }, { status: 500 })
    }

    // DocuSign envelope created successfully
    await admin.from('lois').update({
      envelope_id: envelopeResult.envelopeId,
      status: 'sent',
      sent_at: now,
      loi_html: loiHtml,
    }).eq('id', loi_id)

    await admin.from('deals').update({ status: 'loi' }).eq('id', loi.deal_id)

    await admin.from('activity_log').insert({
      deal_id: loi.deal_id,
      event_type: 'loi_sent',
      event_description: `LOI sent for signature — ${templateType.replace(/_/g, ' ')} — ${loiData.purchase_price}`,
      metadata: { loi_id, envelope_id: envelopeResult.envelopeId, amount: loiData.purchase_price },
    })

    // Send emails
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.kingdombroker.com'

    if (buyerEmail) {
      await sendLOIEmail(
        buyerEmail,
        buyerName,
        `Sign your LOI — ${businessName}`,
        buildEmailHtml(
          `Please Sign Your Letter of Intent`,
          `Your LOI for the acquisition of ${businessName} has been sent for signature. Please review and sign it to proceed.`,
          'Sign LOI Now',
          `${appUrl}/loi/${loi_id}/sign?role=buyer`
        )
      )
    }

    if (sellerEmail) {
      await sendLOIEmail(
        sellerEmail,
        sellerName,
        `Kingdom Broker has submitted an offer for ${businessName}`,
        buildEmailHtml(
          `You Have Received a Letter of Intent`,
          `Kingdom Broker has submitted a Letter of Intent for the acquisition of ${businessName}. Please review the offer — the buyer will sign first, then the document will be sent to you for your countersignature.`,
          'View Offer',
          `${appUrl}/loi/${loi_id}`
        )
      )
    }

    return NextResponse.json({
      success: true,
      envelope_id: envelopeResult.envelopeId,
      status: 'sent',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[LOI Create Envelope] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
