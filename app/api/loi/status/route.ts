import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { getEnvelopeStatus, downloadSignedPDF } from '@/lib/docusign'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

async function notifyEric(subject: string, html: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: 'Kingdom Broker <noreply@kingdombroker.com>',
      to: 'Eric@KingdomBroker.com',
      subject,
      html,
    })
  } catch (err) {
    console.error('[Resend] Eric notification error:', err instanceof Error ? err.message : String(err))
  }
}

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireSession(req)
  if (authError) return authError

  const loi_id = req.nextUrl.searchParams.get('loi_id')

  if (!loi_id) {
    return NextResponse.json({ error: 'loi_id is required' }, { status: 400 })
  }

  try {
    const admin = getAdminSupabase()

    const { data: loi, error: loiErr } = await admin
      .from('lois')
      .select('*')
      .eq('id', loi_id)
      .single()

    if (loiErr || !loi) {
      return NextResponse.json({ error: 'LOI not found' }, { status: 404 })
    }

    // If no envelope, return current status from DB
    if (!loi.envelope_id) {
      return NextResponse.json({
        status: loi.status,
        buyer_signed_at: loi.buyer_signed_at,
        seller_signed_at: loi.seller_signed_at,
      })
    }

    // Poll DocuSign for latest status
    const dsStatus = await getEnvelopeStatus(loi.envelope_id)

    if ('error' in dsStatus) {
      // Return DB status if DocuSign unavailable
      return NextResponse.json({
        status: loi.status,
        buyer_signed_at: loi.buyer_signed_at,
        seller_signed_at: loi.seller_signed_at,
        ds_error: dsStatus.error,
      })
    }

    const { status: newStatus, completedAt } = dsStatus

    // Only update if status changed
    if (newStatus !== loi.status) {
      const updatePayload: Record<string, unknown> = { status: newStatus }

      if (newStatus === 'completed' || newStatus === 'signed') {
        updatePayload.buyer_signed_at = loi.buyer_signed_at || new Date().toISOString()
        updatePayload.seller_signed_at = completedAt || new Date().toISOString()

        // Download and store signed PDF
        const pdfBuffer = await downloadSignedPDF(loi.envelope_id)
        if (pdfBuffer) {
          const { error: uploadErr } = await admin.storage
            .from('lois')
            .upload(`${loi_id}/signed_loi.pdf`, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            })

          if (!uploadErr) {
            const { data: urlData } = admin.storage
              .from('lois')
              .getPublicUrl(`${loi_id}/signed_loi.pdf`)
            updatePayload.signed_pdf_url = urlData.publicUrl
          }
        }

        // Get deal info for notification
        const { data: deal } = await admin
          .from('deals')
          .select('business_name')
          .eq('id', loi.deal_id)
          .single()

        const loiData = (loi.loi_data || {}) as Record<string, string>
        const businessName = deal?.business_name || loiData.business_name || 'the business'

        // Update deal to due_diligence stage
        await admin.from('deals').update({ status: 'due_diligence' }).eq('id', loi.deal_id)

        // Log activity
        await admin.from('activity_log').insert({
          deal_id: loi.deal_id,
          event_type: 'loi_fully_executed',
          event_description: `LOI fully executed — both parties signed — moving to due diligence`,
          metadata: { loi_id, amount: loiData.purchase_price },
        })

        // Notify Eric
        await notifyEric(
          `LOI EXECUTED — ${businessName} — ${loiData.purchase_price}`,
          `<p>Both parties have signed the LOI for ${businessName}.</p>
           <p><strong>Amount:</strong> ${loiData.purchase_price}</p>
           <p><strong>Template:</strong> ${loi.template_type}</p>
           <p>The deal has moved to Due Diligence stage.</p>`
        )
      }

      await admin.from('lois').update(updatePayload).eq('id', loi_id)
    }

    return NextResponse.json({
      status: newStatus,
      buyer_signed_at: loi.buyer_signed_at,
      seller_signed_at: loi.seller_signed_at,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[LOI Status] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
