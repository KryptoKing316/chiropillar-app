import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resolvePersonaId } from '@/lib/digital-twin-persona'

export async function GET(req: NextRequest) {
  const personaParam = req.nextUrl.searchParams.get('persona_id')
  if (!personaParam) return NextResponse.json({ error: 'persona_id required' }, { status: 400 })

  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const personaId = await resolvePersonaId(admin, personaParam)
    if (!personaId) {
      // No persona exists yet — return empty knowledge base instead of failing
      return NextResponse.json({ sources: [], total_chunks: 0 })
    }

    const { data, error } = await admin
      .from('digital_twin_knowledge')
      .select('source_type, source_name, chunk_index, created_at')
      .eq('persona_id', personaId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const sourceMap: Record<string, { source_type: string; source_name: string; chunks: number; created_at: string }> = {}
    for (const row of (data || [])) {
      const key = row.source_name
      if (!sourceMap[key]) {
        sourceMap[key] = { source_type: row.source_type, source_name: row.source_name, chunks: 0, created_at: row.created_at }
      }
      sourceMap[key].chunks++
    }

    const sources = Object.values(sourceMap).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ sources, total_chunks: data?.length || 0 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { persona_id: personaParam, source_name } = await req.json()
  if (!personaParam || !source_name) return NextResponse.json({ error: 'persona_id and source_name required' }, { status: 400 })

  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const personaId = await resolvePersonaId(admin, personaParam)
    if (!personaId) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })

    const { error } = await admin
      .from('digital_twin_knowledge')
      .delete()
      .eq('persona_id', personaId)
      .eq('source_name', source_name)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
