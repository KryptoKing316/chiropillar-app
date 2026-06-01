import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { notFound, redirect } from 'next/navigation'
import ClientPortalShell from './shell'

export const metadata = {
  title: 'Client Portal · Kingdom Broker',
  description: 'Your KB engagement progress, tasks, financials, and exit roadmap.',
}

export default async function ClientPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ demo?: string; tab?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const demoMode = sp.demo === 'true' || slug.startsWith('demo-')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  // Auth gate (non-demo only)
  let userEmail: string | null = null
  if (!demoMode) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      redirect(`/login?next=/clients/${slug}`)
    }
    userEmail = session.user.email ?? null
  }
  const isAdmin = userEmail === 'eric@kingdombroker.com'

  // Fetch client + phases + tasks + documents + activity
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (clientErr || !client) {
    notFound()
  }

  // RLS gate: only owner_email or eric@kingdombroker.com or demo can read
  if (!demoMode && userEmail && client.owner_email !== userEmail && userEmail !== 'eric@kingdombroker.com') {
    notFound()
  }

  const [phasesRes, tasksRes, docsRes, activityRes, signaturesRes] = await Promise.all([
    supabase.from('phases').select('*').eq('client_id', client.id).order('sort_order', { ascending: true }),
    supabase.from('tasks').select('*').eq('client_id', client.id).order('sort_order', { ascending: true }),
    supabase.from('client_documents').select('*').eq('client_id', client.id).order('doc_group').order('sort_order'),
    supabase.from('client_activity_log').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('signature_requests').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
  ])

  return (
    <ClientPortalShell
      client={client}
      phases={phasesRes.data ?? []}
      tasks={tasksRes.data ?? []}
      documents={docsRes.data ?? []}
      activities={activityRes.data ?? []}
      signatures={signaturesRes.data ?? []}
      isDemo={demoMode}
      isAdmin={isAdmin}
      activeTab={sp.tab ?? 'overview'}
    />
  )
}
