import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { module_id, question_index, answer } = await req.json()

    if (!module_id || question_index === undefined || !answer?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Not authenticated — silently succeed (demo mode falls back to localStorage)
      return NextResponse.json({ saved: false, reason: 'unauthenticated' })
    }

    // Get the user's active deal_id from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('demo_deal_id')
      .eq('id', user.id)
      .single()

    const deal_id = profile?.demo_deal_id ?? null

    // Upsert — unique on (user_id, module_id, question_index)
    const { error } = await supabase
      .from('digital_twin_answers')
      .upsert({
        user_id: user.id,
        deal_id,
        module_id,
        question_index,
        answer: answer.trim(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_id,question_index',
      })

    if (error) {
      console.error('[Digital Twin] Save error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('[Digital Twin] Save route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
