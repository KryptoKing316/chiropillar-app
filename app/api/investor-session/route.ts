import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireSession } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// POST /api/investor-session
// Logs investor activity: section views, document downloads, time on section
// Called client-side via IntersectionObserver and download click handlers
export async function POST(req: NextRequest) {
  const corsError = corsCheck(req)
  if (corsError) return corsError

  const rateLimitError = await rateLimit(req)
  if (rateLimitError) return rateLimitError

  const { user, error: authError } = await requireSession(req)
  if (authError) return authError

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const section = sanitizeText(body.section as string)
  const docDownloaded = sanitizeText((body.document_downloaded as string) || '')
  const timeOnSection = Number(body.time_on_section) || 0

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    await admin.from('investor_sessions').insert({
      investor_id: user?.id ?? null,
      investor_name: user?.email ?? 'Unknown',
      section_viewed: section || null,
      time_on_section: timeOnSection,
      document_downloaded: docDownloaded || null,
      ip_address: ip,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch {
    // Non-fatal — tracking should never break the data room
    return NextResponse.json({ success: true })
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 })
}
