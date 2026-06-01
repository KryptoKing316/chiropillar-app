import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'

// POST /api/portal/documents  multipart/form-data:
//   file: File
//   client_slug: string
//   doc_group: string
//   name: string
//   meta?: string
//
// Admin-only. Uploads to Supabase Storage and inserts a documents row.
export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const clientSlug = (form.get('client_slug') as string | null)?.trim()
  const docGroup = (form.get('doc_group') as string | null)?.trim()
  const name = (form.get('name') as string | null)?.trim()
  const meta = (form.get('meta') as string | null)?.trim() || null

  if (!file || !clientSlug || !docGroup || !name) {
    return NextResponse.json({ error: 'file, client_slug, doc_group, name all required' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  // Look up client
  const { data: client } = await admin
    .from('clients')
    .select('id, slug, business_name')
    .eq('slug', clientSlug)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Upload to Storage at path: <slug>/<doc_group>/<filename>
  const safeName = file.name.replace(/[^\w.-]+/g, '_')
  const storagePath = `${clientSlug}/${docGroup.replace(/\W+/g, '_')}/${Date.now()}_${safeName}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from('client-documents')
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  // Insert documents row
  const { data: doc, error: insertError } = await admin
    .from('client_documents')
    .insert({
      client_id: client.id,
      doc_group: docGroup,
      name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type || null,
      status: 'uploaded',
      meta,
      uploaded_by: user.email ?? 'admin',
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Log activity
  await admin.from('client_activity_log').insert({
    client_id: client.id,
    who: user.email?.split('@')[0] === 'eric' ? 'Eric' : (user.email ?? 'KB Team'),
    verb: 'uploaded',
    what: name,
    activity_type: 'doc',
  })

  return NextResponse.json({ ok: true, document: doc })
}
