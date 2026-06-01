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
  const fullName = body.full_name?.trim().slice(0, 120) ?? ''
  const role = body.role === 'buyer' ? 'buyer' : 'seller'

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  // Create the auth user (no password — magic link only)
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })

  if (createError || !newUser?.user) {
    // If user already exists, just return their profile
    if (createError?.message?.includes('already')) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }
    console.error('Create user error:', createError)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  const userId = newUser.user.id

  // Insert profile row
  await admin.from('profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    role,
    created_at: new Date().toISOString(),
  })

  // Seed role-specific empty row
  if (role === 'seller') {
    await admin.from('deals').insert({
      seller_id: userId,
      status: 'onboarding',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  } else {
    await admin.from('buyer_profiles').insert({
      user_id: userId,
      email,
      full_name: fullName,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ success: true, user_id: userId, email, role })
}
