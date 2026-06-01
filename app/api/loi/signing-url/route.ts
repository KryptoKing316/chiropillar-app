import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { getSigningUrl } from '@/lib/docusign'

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireSession(req)
  if (authError) return authError

  try {
    const body = await req.json() as { loi_id?: string; signer_role?: 'buyer' | 'seller' }
    const { loi_id, signer_role } = body

    if (!loi_id) {
      return NextResponse.json({ error: 'loi_id is required' }, { status: 400 })
    }

    if (!signer_role || !['buyer', 'seller'].includes(signer_role)) {
      return NextResponse.json({ error: 'signer_role must be buyer or seller' }, { status: 400 })
    }

    const admin = getAdminSupabase()

    const { data: loi, error: loiErr } = await admin
      .from('lois')
      .select('*')
      .eq('id', loi_id)
      .single()

    if (loiErr || !loi) {
      return NextResponse.json({ error: 'LOI not found' }, { status: 404 })
    }

    if (!loi.envelope_id) {
      return NextResponse.json({
        error: 'This LOI has not been sent for signature yet.',
        code: 'no_envelope',
      }, { status: 400 })
    }

    // Determine signer info based on role
    const loiData = (loi.loi_data || {}) as Record<string, string>
    let signerEmail: string
    let signerName: string
    let clientUserId: string
    let recipientId: string

    if (signer_role === 'buyer') {
      const { data: buyerProfile } = loi.buyer_id
        ? await admin.from('profiles').select('full_name,email').eq('id', loi.buyer_id).single()
        : { data: null }

      signerEmail = buyerProfile?.email || loiData.buyer_email || ''
      signerName = buyerProfile?.full_name || loiData.buyer_name || 'Buyer'
      clientUserId = loi.buyer_id || 'kingdom-broker'
      recipientId = '1'
    } else {
      const { data: sellerProfile } = loi.seller_id
        ? await admin.from('profiles').select('full_name,email').eq('id', loi.seller_id).single()
        : { data: null }

      signerEmail = sellerProfile?.email || loiData.seller_email || ''
      signerName = sellerProfile?.full_name || loiData.seller_name || 'Seller'
      clientUserId = loi.seller_id || ''
      recipientId = '2'
    }

    if (!signerEmail) {
      return NextResponse.json({ error: 'Signer email not found' }, { status: 400 })
    }

    // Get the signing URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.kingdombroker.com'
    const returnUrl = `${appUrl}/loi/${loi_id}/sign?event=signing_complete&role=${signer_role}`

    const result = await getSigningUrl(
      loi.envelope_id,
      signerEmail,
      signerName,
      clientUserId,
      recipientId,
      returnUrl
    )

    if ('error' in result) {
      if (result.notConfigured) {
        return NextResponse.json({
          error: 'DocuSign not configured',
          code: 'no_docusign',
          message: 'Please check your email for the signing link, or contact Eric at Eric@KingdomBroker.com.',
        }, { status: 503 })
      }
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ signing_url: result.signingUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[LOI Signing URL] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
