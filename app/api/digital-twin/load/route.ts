import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ answers: null, reason: 'unauthenticated' })
    }

    const { data, error } = await supabase
      .from('digital_twin_answers')
      .select('module_id, question_index, answer')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })

    if (error) {
      console.error('[Digital Twin] Load error:', error.message)
      return NextResponse.json({ answers: null, error: error.message })
    }

    // Reshape flat rows → { module_id: { question_index: answer } }
    const answers: Record<string, Record<number, string>> = {}
    for (const row of data ?? []) {
      if (!answers[row.module_id]) answers[row.module_id] = {}
      answers[row.module_id][row.question_index] = row.answer
    }

    return NextResponse.json({ answers, count: data?.length ?? 0 })
  } catch (err) {
    console.error('[Digital Twin] Load route error:', err)
    return NextResponse.json({ answers: null, error: 'Server error' })
  }
}
