import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/exchange/invite
// Admin-only: invite a broker to a Exchange firm.
// Body: { firm_slug, email, first_name, last_name, title?, phone?, role? }
// Effects:
//   1. Insert into coalition_members (status: invited, user_id null until they sign in)
//   2. Generate a magic-link via Supabase admin auth (lands them on /exchange)
//   3. Return the magic link so admin can copy/send via their preferred channel
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin-only — for now, KB founders + Eric
  const isAdmin = session.user.email === 'eric@kingdombroker.com'
  if (!isAdmin) {
    // also allow firm admins to invite their own members (future)
    return NextResponse.json({ error: 'Admin access required for invites (for now)' }, { status: 403 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  const body = await req.json()
  const firmSlug = String(body.firm_slug || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const firstName = String(body.first_name || '').trim()
  const lastName = String(body.last_name || '').trim()
  const title = body.title ? String(body.title).trim() : null
  const phone = body.phone ? String(body.phone).trim() : null
  const role = body.role ?? 'broker'

  if (!firmSlug || !email || !firstName || !lastName) {
    return NextResponse.json({ error: 'firm_slug, email, first_name, last_name required' }, { status: 400 })
  }
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Find the firm
  const { data: firm, error: firmErr } = await admin
    .from('coalition_firms')
    .select('id, firm_name, status')
    .eq('slug', firmSlug)
    .single()
  if (firmErr || !firm) {
    return NextResponse.json({ error: `Firm '${firmSlug}' not found` }, { status: 404 })
  }

  // Upsert coalition_members row (idempotent)
  const { data: member, error: memberErr } = await admin
    .from('coalition_members')
    .upsert({
      firm_id: firm.id,
      first_name: firstName,
      last_name: lastName,
      email,
      title,
      phone,
      role,
      is_active: true,
    }, { onConflict: 'email' })
    .select('id')
    .single()

  if (memberErr || !member) {
    return NextResponse.json({ error: memberErr?.message || 'Failed to create member' }, { status: 500 })
  }

  // Generate magic link via Supabase admin auth
  // Uses our existing OTP flow. Lands them on /exchange after sign-in.
  const redirectTo = `https://app.kingdombroker.com/auth/callback?next=/exchange`
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  })

  if (linkErr) {
    return NextResponse.json({
      error: 'Member created but magic link failed: ' + linkErr.message,
      member_id: member.id
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    member_id: member.id,
    firm_name: firm.firm_name,
    email,
    magic_link: linkData.properties?.action_link ?? null,
    // Supabase typically auto-sends the magic link email. But we also return
    // the link so Eric can paste it into his own outbound communication.
    note: 'Supabase auto-sent the magic link email. The action_link above is also available to manually share if needed.',
  })
}

// GET /api/exchange/invite?firm_slug=voyage-acquisitions
// List existing members of a firm (admin view)
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.email === 'eric@kingdombroker.com'
  if (!isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const url = new URL(req.url)
  const firmSlug = url.searchParams.get('firm_slug')

  let query = admin
    .from('coalition_members')
    .select('id, first_name, last_name, email, title, phone, role, is_active, created_at, user_id, coalition_firms!firm_id(slug, firm_name)')
    .order('created_at', { ascending: false })

  if (firmSlug) {
    const { data: firm } = await admin.from('coalition_firms').select('id').eq('slug', firmSlug).single()
    if (firm) query = query.eq('firm_id', firm.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ members: data ?? [] })
}
