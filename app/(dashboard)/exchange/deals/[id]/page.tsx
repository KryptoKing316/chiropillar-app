import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import DealDetailClient from './client'
import type { PendingNdaRequest, BuyerMatch } from './types'

export const metadata = { title: 'Deal Detail · Kingdom Broker Exchange' }

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login?next=/exchange/deals/' + id)

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: deal } = await admin
    .from('coalition_deals')
    .select('*, coalition_firms!source_firm_id(slug,firm_name,logo_url,brand_primary)')
    .eq('id', id)
    .single()

  if (!deal) notFound()

  // Is the requester from the same firm? Then they see private fields too.
  const { data: member } = await admin
    .from('coalition_members')
    .select('id, firm_id')
    .eq('user_id', session.user.id)
    .single()

  const isAdmin = session.user.email === 'eric@kingdombroker.com'
  const isOwnFirm = member?.firm_id === deal.source_firm_id || isAdmin

  // Pending NDA requests — only source firm sees these
  let pendingNdaRequests: PendingNdaRequest[] = []
  if (isOwnFirm) {
    const { data: ndaReqs } = await admin
      .from('coalition_nda_requests')
      .select('id, requester_member_id, requester_firm_id, buyer_profile, status, requested_at, coalition_firms!requester_firm_id(firm_name), coalition_members!requester_member_id(first_name, last_name, email, title)')
      .eq('deal_id', id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })

    pendingNdaRequests = (ndaReqs ?? []).map((r) => {
      const firmRel = r.coalition_firms as { firm_name?: string } | { firm_name?: string }[] | null
      const memberRel = r.coalition_members as
        | { first_name?: string; last_name?: string; email?: string; title?: string }
        | { first_name?: string; last_name?: string; email?: string; title?: string }[]
        | null
      const firm = Array.isArray(firmRel) ? firmRel[0] : firmRel
      const reqMember = Array.isArray(memberRel) ? memberRel[0] : memberRel
      return {
        id: r.id,
        requester_firm_name: firm?.firm_name ?? 'Unknown Firm',
        requester_name: [reqMember?.first_name, reqMember?.last_name].filter(Boolean).join(' ') || reqMember?.email || 'Unknown',
        requester_email: reqMember?.email ?? '',
        requester_title: reqMember?.title ?? '',
        buyer_profile: r.buyer_profile ?? '',
        requested_at: r.requested_at,
      }
    })
  }

  // Signature stats — what's been sent/signed on this deal
  const { data: sigRows } = await admin
    .from('exchange_signatures')
    .select('document_type, status')
    .eq('deal_id', id)

  // Approved NDAs (live in coalition_nda_requests, not exchange_signatures)
  const { count: approvedNdaCount } = await admin
    .from('coalition_nda_requests')
    .select('id', { count: 'exact', head: true })
    .eq('deal_id', id)
    .eq('status', 'approved')

  const sigStats = {
    nda: approvedNdaCount ?? 0,
    loi: (sigRows ?? []).filter((s) => s.document_type === 'loi').length,
    purchase_agreement: (sigRows ?? []).filter((s) => s.document_type === 'purchase_agreement').length,
    custom: (sigRows ?? []).filter((s) => s.document_type === 'custom').length,
  }

  // Buyer matches that Eric has previously run for this deal (visible to source firm + admin)
  let existingMatches: BuyerMatch[] = []
  if (isOwnFirm) {
    const { data: matchRows } = await admin
      .from('coalition_buyer_matches')
      .select('id, buyer_lead_id, buyer_firm_name, buyer_contact_name, buyer_contact_email, buyer_type, match_score, match_reasoning, status, created_at')
      .eq('deal_id', id)
      .order('match_score', { ascending: false })
      .limit(20)
    existingMatches = (matchRows ?? []).map((m) => ({
      id: m.buyer_lead_id ?? m.id,
      firm_name: m.buyer_firm_name ?? 'Unknown',
      contact_name: m.buyer_contact_name ?? undefined,
      contact_email: m.buyer_contact_email ?? undefined,
      buyer_type: m.buyer_type ?? undefined,
      fit_score: m.match_score ?? 0,
      reasoning: m.match_reasoning ?? '',
    }))
  }

  return (
    <DealDetailClient
      deal={deal}
      isOwnFirm={isOwnFirm}
      isAdmin={isAdmin}
      pendingNdaRequests={pendingNdaRequests}
      sigStats={sigStats}
      initialMatches={existingMatches}
    />
  )
}
