import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'

// PATCH /api/portal/tasks  body: { id, status }
// Admin-only. Toggles a task's status between pending / in_progress / completed.
export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, status } = body
  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  }
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  // Look up the task to get client_id for activity logging
  const { data: existing } = await admin
    .from('tasks')
    .select('id, title, client_id, status')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === 'completed') {
    update.completed_at = new Date().toISOString()
  } else {
    update.completed_at = null
  }

  const { error: updateError } = await admin
    .from('tasks')
    .update(update)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Log activity for any status change → in_progress or completed
  if (status !== existing.status) {
    const verb = status === 'completed' ? 'completed' : status === 'in_progress' ? 'started' : 'reopened'
    const who = user.email?.split('@')[0] === 'eric' ? 'Eric' : (user.email ?? 'KB Team')
    await admin.from('client_activity_log').insert({
      client_id: existing.client_id,
      who,
      verb,
      what: existing.title,
      activity_type: 'task',
    })
  }

  return NextResponse.json({ ok: true })
}
