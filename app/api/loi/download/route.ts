import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { downloadSignedPDF } from '@/lib/docusign'

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

    const loiData = (loi.loi_data || {}) as Record<string, string>
    const businessName = loiData.business_name || 'business'
    const fileName = `LOI_${businessName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    // Option 1: Try Supabase Storage (already saved signed PDF)
    if (loi.signed_pdf_url) {
      const { data: fileData, error: dlErr } = await admin.storage
        .from('lois')
        .download(`${loi_id}/signed_loi.pdf`)

      if (!dlErr && fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        })
      }
    }

    // Option 2: Download fresh from DocuSign
    if (loi.envelope_id) {
      const pdfBuffer = await downloadSignedPDF(loi.envelope_id)
      if (pdfBuffer) {
        return new NextResponse(pdfBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        })
      }
    }

    // Option 3: Return the HTML LOI as a fallback (draft state)
    if (loi.loi_html) {
      return new NextResponse(loi.loi_html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="LOI_${businessName.replace(/[^a-zA-Z0-9]/g, '_')}.html"`,
        },
      })
    }

    return NextResponse.json({ error: 'No document available to download' }, { status: 404 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[LOI Download] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
