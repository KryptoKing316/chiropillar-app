import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest) {
  const persona_id = req.nextUrl.searchParams.get('persona_id')
  if (!persona_id) return NextResponse.json({ messages: [] })

  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ messages: [] })

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    const { data } = await admin
      .from('digital_twin_sessions')
      .select('messages')
      .eq('persona_id', persona_id)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ messages: data?.messages ?? [] })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { persona_id, messages } = await req.json()
    if (!persona_id || !messages) return NextResponse.json({ saved: false })

    const user = await getUser()
    if (!user) return NextResponse.json({ saved: false })

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    await admin
      .from('digital_twin_sessions')
      .upsert(
        { persona_id, user_id: user.id, messages, updated_at: new Date().toISOString() },
        { onConflict: 'persona_id,user_id' }
      )

    return NextResponse.json({ saved: true })
  } catch {
    return NextResponse.json({ saved: false })
  }
}
