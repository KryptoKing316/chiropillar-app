import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const cors = corsCheck(req)
  if (cors) return cors

  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const email = body.email?.trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const admin = getAdminSupabase()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.kingdombroker.com'

  // Look up if this email belongs to a client owner — redirect them to their portal
  let redirectPath = '/overview'
  let clientSlug: string | null = null
  const { data: ownerClient } = await admin
    .from('clients')
    .select('slug')
    .eq('owner_email', email)
    .eq('is_demo', false)
    .maybeSingle()

  if (ownerClient?.slug) {
    clientSlug = ownerClient.slug
    redirectPath = `/clients/${ownerClient.slug}`
  }

  const { data, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${baseUrl}${redirectPath}`,
    },
  })

  if (linkError || !data) {
    console.error('Magic link error:', linkError)
    return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
  }

  const magicLink = (data as { properties?: { action_link?: string } }).properties?.action_link ?? ''

  return NextResponse.json({
    success: true,
    magic_link: magicLink,
    email,
    redirect_path: redirectPath,
    client_slug: clientSlug,
  })
}
