'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type Tab = 'sellers' | 'buyers' | 'history' | 'perf' | 'top'
type RunType = 'quick' | 'buyer' | 'seller' | 'both'

interface BuyerLead {
  id: string
  firm_name: string
  contact_name: string
  phone: string
  investor_type: string
  deal_size_min: number
  deal_size_max: number
  fit_score: number
  outreach_status: string
  pitch_email: string
  finders_fee_open: boolean
  date_found: string
}

interface SellerLead {
  id: string
  business_name: string
  owner_name: string
  owner_phone: string
  industry: string
  state: string
  sell_readiness_score: number
  estimated_value_range: string
  outreach_status: string
  personalized_email: string
  date_found: string
}

interface RunHistory {
  id: string
  run_type: string
  status: string
  seller_leads_found: number
  buyer_leads_found: number
  total_cost_usd: number
  started_at: string
}

interface PerfReport {
  id: string
  report_date: string
  week_label: string
  sellers_total: number
  sellers_queued: number
  sellers_contacted: number
  sellers_with_email: number
  sellers_new_week: number
  buyers_total: number
  buyers_queued: number
  buyers_contacted: number
  buyers_new_week: number
  seller_campaign_active: boolean
  buyer_campaign_active: boolean
  buyer_campaign_steps: number
  agent_runs_week: number
  total_cost_week: number
  notes: string | null
  created_at: string
}

interface PerfLive {
  sellers: {
    total: number; queued: number; contacted: number
    not_contacted: number; with_email: number; new_week: number; high_score: number
  }
  buyers: {
    total: number; queued: number; contacted: number
    not_contacted: number; bounced: number; new_week: number; high_score: number
    by_type: [string, number][]
  }
  runs: { total: number; this_week: number; completed: number; cost_week: number; cost_total: number }
  chart: { week: string; sellers_q: number; sellers_c: number; buyers_q: number; buyers_c: number }[]
}

function CallButton({ phone, name }: { phone: string; name: string }) {
  if (!phone) return <span style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>—</span>
  return (
    <a
      href={`tel:${phone.replace(/\D/g, '')}`}
      title={`Call ${name}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', padding: '4px 9px',
        background: 'rgba(46,204,139,0.12)', color: 'var(--kb-green)',
        border: '1px solid rgba(46,204,139,0.25)', borderRadius: '5px',
        textDecoration: 'none', fontFamily: "'Inter', system-ui, sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      <svg viewBox='0 0 14 14' width='14' height='14' fill='none' stroke='var(--kb-text-secondary)' strokeWidth='1.5' strokeLinecap='round'><path d='M5.4 2.3l-1.9-.5c-.5-.1-1 .2-1.1.7l-.3 1.3c-.1.5.2 1.1.6 1.3C5.3 6.6 7.4 8.7 8.9 11.3c.2.4.8.7 1.3.6l1.3-.3c.5-.1.8-.6.7-1.1l-.5-1.9c-.1-.4-.4-.7-.8-.7h-.6c-.2 0-.4-.1-.5-.3-.7-1.2-1.5-2-2.7-2.7-.2-.1-.3-.3-.3-.5v-.6c0-.4-.3-.7-.7-.8z'/></svg> {phone}
    </a>
  )
}

function exportToInstantlyCSV(leads: BuyerLead[] | SellerLead[], type: 'buyers' | 'sellers') {
  let rows: string[][]
  let headers: string[]

  if (type === 'buyers') {
    const bl = leads as BuyerLead[]
    headers = ['first_name', 'email', 'company', 'phone', 'type', 'score', 'email_1_subject', 'email_1_body', 'email_2_body']
    rows = bl.map(l => [
      l.contact_name?.split(' ')[0] ?? '',
      '',
      l.firm_name ?? '',
      l.phone ?? '',
      l.investor_type ?? '',
      String(l.fit_score),
      `Kingdom Broker — ${l.investor_type} Acquisition Opportunity`,
      l.pitch_email ?? '',
      `Hi ${l.contact_name?.split(' ')[0] ?? 'there'}, just wanted to resurface this. Still looking for deals in this range? Happy to share details under NDA. — Eric`,
    ])
  } else {
    const sl = leads as SellerLead[]
    headers = ['first_name', 'email', 'company', 'phone', 'industry', 'state', 'score', 'est_value', 'email_1_body', 'email_2_body']
    rows = sl.map(l => [
      l.owner_name?.split(' ')[0] ?? '',
      '',
      l.business_name ?? '',
      l.owner_phone ?? '',
      l.industry ?? '',
      l.state ?? '',
      String(l.sell_readiness_score),
      l.estimated_value_range ?? '',
      l.personalized_email ?? '',
      `Hi ${l.owner_name?.split(' ')[0] ?? 'there'}, following up on my last note. If timing isn't right, no problem — just wanted to make sure you had my contact. — Eric Skeldon, Kingdom Broker`,
    ])
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, ' ')}"`
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `instantly-${type}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const DFW_CITIES = ['dallas', 'fort worth', 'plano', 'arlington', 'irving', 'frisco', 'mckinney', 'denton', 'garland', 'richardson', 'carrollton', 'lewisville', 'allen', 'flower mound', 'mansfield', 'cedar hill', 'mesquite', 'grand prairie', 'desoto', 'rockwall', 'rowlett', 'wylie', 'sachse', 'murphy', 'prosper', 'celina', 'midlothian', 'waxahachie', 'southlake', 'keller', 'grapevine', 'colleyville', 'coppell', 'highland park', 'university park', 'the colony', 'little elm', 'forney', 'heath', 'lavon', 'lucas', 'princeton', 'anna', 'duncanville', 'lancaster']

function isDFW(lead: SellerLead): boolean {
  const state = (lead.state ?? '').toLowerCase().trim()
  if (state !== 'tx' && state !== 'texas') return false
  const biz = (lead.business_name ?? '').toLowerCase()
  const industry = (lead.industry ?? '').toLowerCase()
  const all = biz + ' ' + industry
  return DFW_CITIES.some(c => all.includes(c)) || state === 'tx'
}

function ScoreBadge({ score, max }: { score: number; max?: number }) {
  const m = max ?? 10
  const pct = score / m
  const color = pct >= 0.8 ? '#2ECC8B' : pct >= 0.6 ? '#C9A84C' : pct >= 0.4 ? '#E89B3C' : '#E87373'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 590, color, fontFamily: "'DM Mono', monospace" }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      {score}/{m}
    </span>
  )
}

function TopLeadsPanel({ sellerLeads, buyerLeads }: { sellerLeads: SellerLead[]; buyerLeads: BuyerLead[] }) {
  const [subTab, setSubTab] = useState<'all_sellers' | 'dfw' | 'all_buyers'>('all_sellers')

  const topSellers = [...sellerLeads].sort((a, b) => (b.sell_readiness_score ?? 0) - (a.sell_readiness_score ?? 0)).slice(0, 100)
  const dfwSellers = [...sellerLeads].filter(isDFW).sort((a, b) => (b.sell_readiness_score ?? 0) - (a.sell_readiness_score ?? 0)).slice(0, 100)
  const topBuyers = [...buyerLeads].sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0)).slice(0, 100)

  const sH = { textAlign: 'left' as const, padding: '8px 10px', fontSize: '10px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.07em', textTransform: 'uppercase' as const, borderBottom: '1px solid var(--kb-border-subtle)', whiteSpace: 'nowrap' as const }
  const tD = { padding: '10px 10px', borderBottom: '1px solid var(--kb-border-subtle)', fontSize: '12px', color: 'var(--kb-text)' }

  return (
    <div>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 590, color: 'var(--kb-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Top Priority Leads</div>
          <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '4px' }}>Ranked by Claude&apos;s score — top 100 of each. Auto-updates after every agent run.</div>
        </div>
        <div style={{ display: 'flex', gap: '3px', background: 'var(--kb-bg-raised)', borderRadius: '8px', padding: '3px' }}>
          {[
            { key: 'all_sellers', label: `Sellers (${topSellers.length})`, icon: '◆' },
            { key: 'dfw', label: `DFW (${dfwSellers.length})`, icon: '▸' },
            { key: 'all_buyers', label: `Buyers (${topBuyers.length})`, icon: '◎' },
          ].map(s => (
            <button key={s.key} onClick={() => setSubTab(s.key as typeof subTab)} style={{
              padding: '7px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              background: subTab === s.key ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: subTab === s.key ? '#C9A84C' : 'var(--kb-text-secondary)',
              fontSize: '12px', fontWeight: subTab === s.key ? 600 : 400,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ALL SELLERS or DFW SELLERS */}
      {(subTab === 'all_sellers' || subTab === 'dfw') && (
        <>
          {subTab === 'dfw' && (
            <div style={{ background: 'var(--kb-accent-dim)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: 'var(--kb-accent)', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Showing Texas sellers — Dallas-Fort Worth metro focus. {dfwSellers.length} leads found.
            </div>
          )}
          {(subTab === 'all_sellers' ? topSellers : dfwSellers).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--kb-text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{subTab === 'dfw' ? '▸' : '◆'}</div>
              <div style={{ fontSize: '13px' }}>No {subTab === 'dfw' ? 'DFW ' : ''}seller leads yet. Run a seller pipeline to populate.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Business', 'Owner', 'Phone', 'Industry', 'State', 'Score', 'Est. Value', 'Status'].map(h => (
                    <th key={h} style={sH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(subTab === 'all_sellers' ? topSellers : dfwSellers).map((l, i) => (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ ...tD, color: 'var(--kb-text-muted)', fontSize: '10px', fontFamily: "'DM Mono', monospace" }}>{i + 1}</td>
                    <td style={{ ...tD, fontWeight: 510, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.business_name ?? '—'}</td>
                    <td style={{ ...tD, color: 'var(--kb-text-secondary)' }}>{l.owner_name ?? '—'}</td>
                    <td style={tD}><CallButton phone={l.owner_phone ?? ''} name={l.owner_name ?? ''} /></td>
                    <td style={{ ...tD, color: 'var(--kb-text-secondary)', fontSize: '11px' }}>{l.industry ?? '—'}</td>
                    <td style={{ ...tD, color: 'var(--kb-text-secondary)', fontSize: '11px' }}>{l.state ?? '—'}</td>
                    <td style={tD}><ScoreBadge score={l.sell_readiness_score ?? 0} /></td>
                    <td style={{ ...tD, color: 'var(--kb-green)', fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>{l.estimated_value_range ?? '—'}</td>
                    <td style={tD}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 510,
                        background: l.outreach_status === 'Contacted' ? 'rgba(91,141,238,0.12)' : l.outreach_status === 'Replied' ? 'rgba(46,204,139,0.12)' : 'var(--kb-bg-raised)',
                        color: l.outreach_status === 'Contacted' ? '#5b8dee' : l.outreach_status === 'Replied' ? '#2ECC8B' : 'var(--kb-text-muted)',
                      }}>{l.outreach_status ?? 'Not Contacted'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ALL BUYERS */}
      {subTab === 'all_buyers' && (
        <>
          {topBuyers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--kb-text-muted)' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px', color: '#5b8dee' }}><svg viewBox='0 0 24 24' width='32' height='32' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='5'/><circle cx='12' cy='12' r='1' fill='currentColor'/></svg></div>
              <div style={{ fontSize: '13px' }}>No buyer leads yet. Run a buyer pipeline to populate.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Firm', 'Contact', 'Phone', 'Type', 'Deal Size', 'Score', 'Finders Fee', 'Status'].map(h => (
                    <th key={h} style={sH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topBuyers.map((l, i) => (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ ...tD, color: 'var(--kb-text-muted)', fontSize: '10px', fontFamily: "'DM Mono', monospace" }}>{i + 1}</td>
                    <td style={{ ...tD, fontWeight: 510, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.firm_name ?? '—'}</td>
                    <td style={{ ...tD, color: 'var(--kb-text-secondary)' }}>{l.contact_name ?? '—'}</td>
                    <td style={tD}><CallButton phone={l.phone ?? ''} name={l.contact_name ?? ''} /></td>
                    <td style={tD}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'var(--kb-accent-dim)', color: 'var(--kb-accent)', fontWeight: 500 }}>{l.investor_type ?? '—'}</span>
                    </td>
                    <td style={{ ...tD, color: 'var(--kb-text-secondary)', fontSize: '11px', fontFamily: "'DM Mono', monospace" }}>
                      {l.deal_size_min && l.deal_size_max ? `$${(l.deal_size_min / 1e6).toFixed(1)}M–$${(l.deal_size_max / 1e6).toFixed(1)}M` : '—'}
                    </td>
                    <td style={tD}><ScoreBadge score={l.fit_score ?? 0} /></td>
                    <td style={tD}>
                      {l.finders_fee_open ? <span style={{ fontSize: '10px', color: 'var(--kb-green)' }}>done Open</span> : <span style={{ fontSize: '10px', color: 'var(--kb-text-muted)' }}>—</span>}
                    </td>
                    <td style={tD}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 510,
                        background: l.outreach_status === 'Contacted' ? 'rgba(91,141,238,0.12)' : l.outreach_status === 'Replied' ? 'rgba(46,204,139,0.12)' : 'var(--kb-bg-raised)',
                        color: l.outreach_status === 'Contacted' ? '#5b8dee' : l.outreach_status === 'Replied' ? '#2ECC8B' : 'var(--kb-text-muted)',
                      }}>{l.outreach_status ?? 'Not Contacted'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

const RUN_BUTTONS: { type: RunType; label: string; sublabel: string; color: string; bg: string; border: string }[] = [
  {
    type: 'quick',
    label: 'Quick Test',
    sublabel: '~$0.75 · ~15 min · buyer only',
    color: 'var(--kb-green)',
    bg: 'rgba(46,204,139,0.1)',
    border: 'rgba(46,204,139,0.3)',
  },
  {
    type: 'buyer',
    label: 'Buyer Pipeline',
    sublabel: 'Full run · investors & PE firms',
    color: '#5b8dee',
    bg: 'rgba(91,141,238,0.1)',
    border: 'rgba(91,141,238,0.3)',
  },
  {
    type: 'seller',
    label: 'Seller Pipeline',
    sublabel: 'Full run · business owners',
    color: 'var(--kb-accent)',
    bg: 'rgba(201,168,76,0.1)',
    border: 'rgba(201,168,76,0.3)',
  },
  {
    type: 'both',
    label: 'Both Pipelines',
    sublabel: 'Full parallel run · ~$3–5',
    color: 'var(--kb-text)',
    bg: 'rgba(242,238,231,0.07)',
    border: 'rgba(242,238,231,0.2)',
  },
]

const SELLER_AGENTS = [
  { name: 'Search Agent',        tool: 'Serper API',       desc: 'Google/Bing for owners in 12 industries showing sell signals' },
  { name: 'Directory Scraper',   tool: 'Playwright',       desc: 'Scrapes Yelp, BBB, chamber directories for business listings' },
  { name: 'Qualifier & Scorer',  tool: 'Claude AI',        desc: 'Scores seller readiness 1–10 (retirement, age, succession gaps)' },
  { name: 'Enrichment Agent',    tool: 'Apollo.io',        desc: 'Finds owner name, email, phone from business data' },
  { name: 'Outreach Writer',     tool: 'Claude AI',        desc: 'Writes personalized email per seller + free valuation CTA' },
  { name: 'Export Agent',        tool: 'Excel + Supabase', desc: 'Outputs scored list with call schedule columns' },
]

const BUYER_AGENTS = [
  { name: 'Search Agent',        tool: 'Serper API',       desc: 'Searches for family offices, PE funds, search funds, independent sponsors' },
  { name: 'Directory Scraper',   tool: 'Playwright',       desc: 'Scrapes Axial, SearchFunder, BizBuySell, SMBash, family office databases' },
  { name: 'Fit Scorer',          tool: 'Claude AI',        desc: 'Scores buyer fit 1–10 + flags finders fee opportunity' },
  { name: 'Enrichment Agent',    tool: 'Apollo.io',        desc: 'Finds contact name, email, direct phone per firm' },
  { name: 'Pitch Writer',        tool: 'Claude AI',        desc: 'Writes personalized pitch email + follow-up per buyer' },
  { name: 'Export Agent',        tool: 'Sheets + Supabase',desc: 'Saves to Google Sheets + buyer_leads table in dashboard' },
]

// ── Perf Dashboard Component ──────────────────────────────────────────────────

function StatPill({ label, value, color = '#C9A84C', sub }: {
  label: string; value: number | string; color?: string; sub?: string
}) {
  return (
    <div style={{ background: 'var(--kb-bg-surface)', border: '1px solid var(--kb-border-subtle)', borderRadius: '10px', padding: '14px 16px', minWidth: '120px' }}>
      <div style={{ fontSize: '26px', fontWeight: 590, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function CampaignBadge({ active, label, steps }: { active: boolean; label: string; steps?: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
      background: active ? 'rgba(46,204,139,0.06)' : 'rgba(232,73,73,0.06)',
      border: `1px solid ${active ? 'rgba(46,204,139,0.2)' : 'rgba(232,73,73,0.2)'}`,
      borderRadius: '8px',
    }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: active ? '#2ECC8B' : '#E87373', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '12px', color: 'var(--kb-text)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '10px', color: active ? '#2ECC8B' : '#E87373' }}>
          {active ? 'Active' : 'Paused'}{steps !== undefined ? ` · ${steps} step${steps !== 1 ? 's' : ''}` : ''}
        </div>
      </div>
    </div>
  )
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '8px', fontSize: '12px' },
  labelStyle: { color: 'var(--kb-text-secondary)' },
  itemStyle: { color: 'var(--kb-text)' },
}

function PerfDashboard({ live, reports, loading, expanded, onExpand, onRefresh }: {
  live: PerfLive | null
  reports: PerfReport[]
  loading: boolean
  expanded: string | null
  onExpand: (id: string | null) => void
  onRefresh: () => void
}) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--kb-text-muted)', fontSize: '13px' }}>
      Loading performance data...
    </div>
  )

  if (!live) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ marginBottom: '12px', color: 'var(--kb-accent)' }}><svg viewBox='0 0 24 24' width='32' height='32' fill='none' stroke='currentColor' strokeWidth='1.5'><rect x='3' y='12' width='4' height='9' rx='1'/><rect x='10' y='7' width='4' height='14' rx='1'/><rect x='17' y='3' width='4' height='18' rx='1'/></svg></div>
      <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '8px' }}>No data yet</div>
      <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)', marginBottom: '16px' }}>Run weekly_report.py to generate the first snapshot</div>
      <button onClick={onRefresh} style={{ fontSize: '12px', padding: '7px 16px', background: 'var(--kb-accent-dim)', color: 'var(--kb-accent)', border: '1px solid var(--kb-accent-border)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
        Refresh
      </button>
    </div>
  )

  const hasChart = live.chart && live.chart.length > 1

  return (
    <div style={{ padding: '4px 0' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--kb-text)' }}>This Week — Live</div>
          <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button onClick={onRefresh} style={{ fontSize: '11px', padding: '5px 12px', background: 'var(--kb-bg-raised)', color: 'var(--kb-text-secondary)', border: '1px solid var(--kb-border)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Live KPI grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <StatPill label="Sellers Total"   value={live.sellers.total}     color="#C9A84C" sub={`+${live.sellers.new_week} this week`} />
        <StatPill label="Sellers Queued"  value={live.sellers.queued}    color="#C9A84C" sub={`${live.sellers.with_email} have email`} />
        <StatPill label="Buyers Total"    value={live.buyers.total}      color="#2ECC8B" sub={`+${live.buyers.new_week} this week`} />
        <StatPill label="Buyers Queued"   value={live.buyers.queued}     color="#2ECC8B" sub={`${live.buyers.contacted} contacted`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
        <StatPill label="Sellers Contacted" value={live.sellers.contacted} color="#5b8dee" />
        <StatPill label="Hot Sellers 8+"    value={live.sellers.high_score} color="#C9A84C" />
        <StatPill label="Hot Buyers 8+"     value={live.buyers.high_score}  color="#2ECC8B" />
        <StatPill label="Runs This Week"    value={live.runs.this_week}     color="#5b8dee" sub={`$${live.runs.cost_week.toFixed(2)} cost`} />
      </div>

      {/* ── Campaign status ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Campaign Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {reports.length > 0 ? (
            <>
              <CampaignBadge active={reports[0].seller_campaign_active} label="Seller Campaign" />
              <CampaignBadge active={reports[0].buyer_campaign_active}  label="Buyer Campaign" steps={reports[0].buyer_campaign_steps} />
            </>
          ) : (
            <div style={{ gridColumn: '1/-1', fontSize: '12px', color: 'var(--kb-text-muted)' }}>No campaign data yet — run weekly_report.py</div>
          )}
        </div>
      </div>

      {/* ── Buyer breakdown by type ── */}
      {live.buyers.by_type.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Buyers by Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {live.buyers.by_type.map(([type, count]) => (
              <div key={type} style={{ padding: '5px 12px', background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.15)', borderRadius: '12px', fontSize: '12px', color: 'var(--kb-text-secondary)' }}>
                {type.replace(/_/g, ' ')} <strong style={{ color: 'var(--kb-green)' }}>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trend chart ── */}
      {hasChart && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>
            8-Week Trend — Queued &amp; Contacted
          </div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={live.chart} barSize={14} barGap={2}>
                <XAxis dataKey="week" tick={{ fill: 'var(--kb-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--kb-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--kb-text-secondary)' }} />
                <Bar dataKey="sellers_q" name="Sellers Queued"    fill="#C9A84C"          radius={[3,3,0,0]} />
                <Bar dataKey="buyers_q"  name="Buyers Queued"     fill="#2ECC8B"          radius={[3,3,0,0]} />
                <Bar dataKey="sellers_c" name="Sellers Contacted" fill="rgba(201,168,76,0.35)" radius={[3,3,0,0]} />
                <Bar dataKey="buyers_c"  name="Buyers Contacted"  fill="rgba(46,204,139,0.35)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Prior reports archive ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Weekly Report Archive ({reports.length})
          </div>
          <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>Sent every Wed &amp; Fri → Eric + Dennis</div>
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--kb-border)', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>
              No saved reports yet — weekly_report.py saves a snapshot each time it runs.<br />
              <span style={{ color: 'var(--kb-accent)' }}>python3 weekly_report.py</span> to generate the first one.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reports.map((rpt, i) => {
              const isOpen = expanded === rpt.id
              const isLatest = i === 0
              return (
                <div key={rpt.id} style={{
                  background: isLatest ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isLatest ? 'rgba(201,168,76,0.18)' : 'var(--kb-bg-raised)'}`,
                  borderRadius: '10px', overflow: 'hidden',
                }}>
                  {/* Card header — always visible */}
                  <div
                    onClick={() => onExpand(isOpen ? null : rpt.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '10px', color: isLatest ? '#C9A84C' : 'var(--kb-text-muted)', fontFamily: "'DM Mono', monospace", minWidth: '90px' }}>
                        {new Date(rpt.report_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>{rpt.week_label || 'Week Report'}</div>
                      {isLatest && <span style={{ fontSize: '9px', padding: '1px 7px', background: 'var(--kb-accent-dim)', color: 'var(--kb-accent)', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latest</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--kb-accent)' }}>{rpt.sellers_queued}S</span>
                        <span style={{ color: 'var(--kb-green)' }}>{rpt.buyers_queued}B</span>
                        <span style={{ color: '#5b8dee' }}>{rpt.sellers_contacted + rpt.buyers_contacted} contacted</span>
                      </div>
                      <span style={{ color: 'var(--kb-text-muted)', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--kb-border-subtle)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
                        {[
                          { label: 'Sellers Total',    value: rpt.sellers_total,     color: 'var(--kb-accent)' },
                          { label: 'Sellers Queued',   value: rpt.sellers_queued,    color: 'var(--kb-accent)' },
                          { label: 'Sellers w/ Email', value: rpt.sellers_with_email,color: 'var(--kb-text-secondary)' },
                          { label: 'New Sellers',      value: rpt.sellers_new_week,  color: 'var(--kb-accent)' },
                          { label: 'Buyers Total',     value: rpt.buyers_total,      color: 'var(--kb-green)' },
                          { label: 'Buyers Queued',    value: rpt.buyers_queued,     color: 'var(--kb-green)' },
                          { label: 'Buyers Contacted', value: rpt.buyers_contacted,  color: 'var(--kb-green)' },
                          { label: 'New Buyers',       value: rpt.buyers_new_week,   color: 'var(--kb-green)' },
                        ].map(m => (
                          <div key={m.label} style={{ background: 'var(--kb-bg-raised)', borderRadius: '7px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 590, color: m.color, fontFamily: "'DM Mono', monospace" }}>{m.value ?? 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>{m.label}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <CampaignBadge active={rpt.seller_campaign_active} label="Seller Campaign" />
                        <CampaignBadge active={rpt.buyer_campaign_active}  label="Buyer Campaign" steps={rpt.buyer_campaign_steps} />
                        <div style={{ padding: '8px 12px', background: 'rgba(91,141,238,0.06)', border: '1px solid rgba(91,141,238,0.15)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#5b8dee', fontWeight: 500 }}>{rpt.agent_runs_week} runs</div>
                          <div style={{ fontSize: '10px', color: 'var(--kb-text-muted)' }}>${(rpt.total_cost_week ?? 0).toFixed(2)} cost this week</div>
                        </div>
                      </div>

                      {rpt.notes && (
                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--kb-text-secondary)', background: 'var(--kb-bg-card)', borderRadius: '6px', padding: '10px 12px', borderLeft: '2px solid rgba(201,168,76,0.3)' }}>
                          {rpt.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('buyers')
  const [buyerLeads, setBuyerLeads] = useState<BuyerLead[]>([])
  const [sellerLeads, setSellerLeads] = useState<SellerLead[]>([])
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [runningType, setRunningType] = useState<RunType | null>(null)
  const [lastMessage, setLastMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [perfLive, setPerfLive] = useState<PerfLive | null>(null)
  const [perfReports, setPerfReports] = useState<PerfReport[]>([])
  const [perfLoading, setPerfLoading] = useState(false)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  // Admin guard
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase() ?? ''
      if (!email) { router.replace('/login'); return }
      const isEric = email === 'eric@kingdombroker.com'
      if (!isEric) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session!.user.id).single()
        if (profile?.role !== 'admin') { router.replace('/overview'); return }
      }
      setAuthorized(true)
      setAuthToken(session?.access_token ?? null)
    })
  }, [router])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const authHeaders: HeadersInit = authToken
        ? { 'Authorization': `Bearer ${authToken}` }
        : {}
      const [bRes, sRes, hRes] = await Promise.all([
        fetch('/api/buyer-leads?limit=200&sort=fit_score', { headers: authHeaders }),
        fetch('/api/seller-leads?limit=200&sort=sell_readiness_score', { headers: authHeaders }),
        fetch('/api/agent-status', { headers: authHeaders }),
      ])
      if (bRes.ok) { const d = await bRes.json(); setBuyerLeads(d.data ?? []) }
      if (sRes.ok) { const d = await sRes.json(); setSellerLeads(d.data ?? []) }
      if (hRes.ok) { const d = await hRes.json(); setRunHistory(d.runs ?? []) }
    } catch { /* silent */ }
    setLoading(false)
  }, [authToken])

  const loadPerf = useCallback(async () => {
    if (!authToken) return
    setPerfLoading(true)
    try {
      const res = await fetch('/api/admin/perf', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      if (res.ok) {
        const d = await res.json()
        setPerfLive(d.live ?? null)
        setPerfReports(d.reports ?? [])
      }
    } catch { /* silent */ }
    setPerfLoading(false)
  }, [authToken])

  useEffect(() => {
    if (tab === 'perf' && authToken) loadPerf()
  }, [tab, authToken, loadPerf])

  useEffect(() => {
    if (!authorized || !authToken) return
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [authorized, authToken, loadData])

  const triggerRun = async (type: RunType) => {
    setRunningType(type)
    setLastMessage(null)
    try {
      const res = await fetch('/api/run-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        setLastMessage({ text: `done ${type === 'quick' ? 'Quick test' : type + ' pipeline'} queued — kb_listener.py will pick it up automatically.`, ok: true })
        loadData()
      } else {
        const d = await res.json()
        setLastMessage({ text: d.error ?? 'Failed to queue run.', ok: false })
      }
    } catch {
      setLastMessage({ text: 'Network error — is the app deployed?', ok: false })
    }
    setRunningType(null)
  }

  if (!authorized) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--kb-text-muted)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      Checking access...
    </div>
  )

  const latestRun = runHistory[0]
  const isRunning = latestRun?.status === 'running' || latestRun?.status === 'requested'

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)', letterSpacing: '0.08em', fontWeight: 510, textTransform: 'uppercase' }}>Admin · Agent Command Center</div>
        <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(231,76,60,0.12)', color: '#E87373', borderRadius: '4px', border: '1px solid rgba(232,73,73,0.25)', fontWeight: 500 }}>Admin Only</span>
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 510, margin: '0 0 4px' }}>Agent Command Center</h1>
      <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
        Click to queue a pipeline run. Requires <code style={{ fontSize: '12px', color: 'var(--kb-accent)', background: 'var(--kb-accent-dim)', padding: '1px 5px', borderRadius: '3px' }}>python3 kb_listener.py</code> running on your Mac.
      </p>

      {/* Listener status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px', borderRadius: '10px', marginBottom: '20px',
        background: isRunning ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isRunning ? 'rgba(201,168,76,0.25)' : 'var(--kb-border)'}`,
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#C9A84C' : 'var(--kb-text-muted)', boxShadow: isRunning ? '0 0 0 4px rgba(201,168,76,0.2)' : 'none' }} />
        <span style={{ fontSize: '13px', color: isRunning ? '#C9A84C' : 'var(--kb-text-secondary)' }}>
          {isRunning
            ? `Pipeline running: ${latestRun.run_type} — started ${new Date(latestRun.started_at).toLocaleTimeString()}`
            : latestRun
              ? `Last run: ${latestRun.run_type} · ${latestRun.status} · ${new Date(latestRun.started_at).toLocaleDateString()}`
              : 'No runs yet — click a button below to queue your first run'}
        </span>
      </div>

      {/* Feedback message */}
      {lastMessage && (
        <div style={{
          padding: '11px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px',
          background: lastMessage.ok ? 'rgba(46,204,139,0.08)' : 'rgba(232,73,73,0.08)',
          border: `1px solid ${lastMessage.ok ? 'rgba(46,204,139,0.3)' : 'rgba(232,73,73,0.25)'}`,
          color: lastMessage.ok ? '#2ECC8B' : '#E87373',
        }}>
          {lastMessage.text}
        </div>
      )}

      {/* Run Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {RUN_BUTTONS.map(({ type, label, sublabel, color, bg, border }) => (
          <button
            key={type}
            onClick={() => triggerRun(type)}
            disabled={runningType !== null || isRunning}
            style={{
              padding: '16px 14px', background: bg,
              border: `1px solid ${border}`, borderRadius: '12px',
              color, textAlign: 'left', cursor: runningType !== null || isRunning ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif", opacity: runningType === type ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 590, marginBottom: '4px' }}>
              {runningType === type ? 'Queuing...' : label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)' }}>{sublabel}</div>
          </button>
        ))}
      </div>

      {/* Terminal fallback */}
      <details style={{ marginBottom: '24px' }}>
        <summary style={{ fontSize: '12px', color: 'var(--kb-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
          ▸ Run manually in Terminal instead
        </summary>
        <div style={{ marginTop: '10px', background: 'var(--kb-bg)', borderRadius: '8px', padding: '14px 16px', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--kb-text-secondary)', lineHeight: 2 }}>
          <div><span style={{ color: 'var(--kb-text-muted)' }}># Quick test</span></div>
          <div><span style={{ color: 'var(--kb-accent)' }}>python3</span> KB_Orchestrator.py --quick --buyer-only</div>
          <div style={{ marginTop: '8px' }}><span style={{ color: 'var(--kb-text-muted)' }}># Buyer only</span></div>
          <div><span style={{ color: 'var(--kb-accent)' }}>python3</span> KB_Orchestrator.py --buyer-only</div>
          <div style={{ marginTop: '8px' }}><span style={{ color: 'var(--kb-text-muted)' }}># Seller only</span></div>
          <div><span style={{ color: 'var(--kb-accent)' }}>python3</span> KB_Orchestrator.py --seller-only</div>
          <div style={{ marginTop: '8px' }}><span style={{ color: 'var(--kb-text-muted)' }}># Both pipelines</span></div>
          <div><span style={{ color: 'var(--kb-accent)' }}>python3</span> KB_Orchestrator.py</div>
        </div>
      </details>

      {/* Agent pipeline panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        {([
          { title: 'Seller Discovery Pipeline', subtitle: 'Finds $1M–$20M business owners ready to sell', agents: SELLER_AGENTS },
          { title: 'Buyer Discovery Pipeline', subtitle: 'Finds family offices, PE funds & search funds', agents: BUYER_AGENTS },
        ] as const).map(panel => (
          <div key={panel.title} style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '3px' }}>{panel.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--kb-text-muted)' }}>{panel.subtitle}</div>
            </div>
            {panel.agents.map((a, i) => (
              <div key={i} title={a.desc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--kb-bg-card)', borderRadius: '6px', marginBottom: '4px', cursor: 'default' }}>
                <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--kb-text-muted)', marginRight: '8px', fontSize: '10px' }}>{i + 1}</span>
                  {a.name}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--kb-text-muted)', fontFamily: "'DM Mono', monospace" }}>{a.tool}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        {[
          { label: 'Buyer Leads', value: buyerLeads.length, color: 'var(--kb-green)' },
          { label: 'Seller Leads', value: sellerLeads.length, color: 'var(--kb-green)' },
          { label: 'Hot Buyers (8+)', value: buyerLeads.filter(l => l.fit_score >= 8).length, color: 'var(--kb-accent)' },
          { label: 'Finders Fee Open', value: buyerLeads.filter(l => l.finders_fee_open).length, color: '#5b8dee' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 590, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--kb-border-subtle)', paddingRight: '16px' }}>
          <div style={{ display: 'flex' }}>
            {(['top', 'buyers', 'sellers', 'history', 'perf'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '13px 20px', background: tab === t ? 'rgba(201,168,76,0.07)' : 'transparent',
                color: tab === t ? '#C9A84C' : 'var(--kb-text-secondary)', border: 'none',
                borderBottom: `2px solid ${tab === t ? '#C9A84C' : 'transparent'}`,
                fontSize: '13px', fontWeight: tab === t ? 500 : 400,
                cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {t === 'top' ? 'Top Leads'
                  : t === 'sellers' ? `Seller Leads${sellerLeads.length > 0 ? ` (${sellerLeads.length})` : ''}`
                  : t === 'buyers' ? `Buyer Leads${buyerLeads.length > 0 ? ` (${buyerLeads.length})` : ''}`
                  : t === 'history' ? 'Run History'
                  : 'Performance'}
              </button>
            ))}
          </div>
          {tab !== 'history' && (
            <button
              onClick={() => exportToInstantlyCSV(tab === 'buyers' ? buyerLeads : sellerLeads, tab as 'buyers' | 'sellers')}
              style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(91,141,238,0.12)', color: '#5b8dee', border: '1px solid rgba(91,141,238,0.25)', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}
            >
              ↓ Export CSV for Instantly
            </button>
          )}
        </div>

        <div style={{ padding: '20px', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--kb-text-muted)', fontSize: '13px' }}>Loading from Supabase...</div>
          ) : tab === 'top' ? (
            <TopLeadsPanel sellerLeads={sellerLeads} buyerLeads={buyerLeads} />
          ) : tab === 'buyers' && buyerLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ marginBottom: '12px', color: '#5b8dee' }}><svg viewBox='0 0 24 24' width='36' height='36' fill='none' stroke='currentColor' strokeWidth='1.5'><circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='5'/><circle cx='12' cy='12' r='1' fill='currentColor'/></svg></div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '6px' }}>No buyer leads yet</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>Click Quick Test above to run your first pipeline</div>
            </div>
          ) : tab === 'sellers' && sellerLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ marginBottom: '12px', color: 'var(--kb-accent)' }}><svg viewBox='0 0 24 24' width='36' height='36' fill='none' stroke='currentColor' strokeWidth='1.5'><rect x='4' y='4' width='16' height='16' rx='3'/><line x1='9' y1='4' x2='9' y2='20'/><line x1='15' y1='4' x2='15' y2='20'/><line x1='4' y1='10' x2='20' y2='10'/></svg></div>
              <div style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', marginBottom: '6px' }}>No seller leads yet</div>
              <div style={{ fontSize: '12px', color: 'var(--kb-text-muted)' }}>Click Seller Pipeline above to start finding business owners</div>
            </div>
          ) : tab === 'buyers' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>{['Firm', 'Contact', 'Phone', 'Type', 'Deal Size', 'Score', 'Finders Fee', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid var(--kb-border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {buyerLeads.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                    <td style={{ padding: '11px 10px', fontWeight: 510, whiteSpace: 'nowrap' }}>{l.firm_name}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', whiteSpace: 'nowrap' }}>{l.contact_name || '—'}</td>
                    <td style={{ padding: '11px 10px' }}><CallButton phone={l.phone} name={l.contact_name} /></td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', fontSize: '12px' }}>{l.investor_type}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {l.deal_size_min && l.deal_size_max ? `$${(l.deal_size_min / 1e6).toFixed(0)}M–$${(l.deal_size_max / 1e6).toFixed(0)}M` : '—'}
                    </td>
                    <td style={{ padding: '11px 10px' }}><span style={{ color: l.fit_score >= 8 ? '#2ECC8B' : '#C9A84C', fontWeight: 600 }}>{l.fit_score}/10</span></td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 7px', background: l.finders_fee_open ? 'rgba(91,141,238,0.12)' : 'rgba(74,88,128,0.12)', color: l.finders_fee_open ? '#5b8dee' : 'var(--kb-text-muted)', borderRadius: '4px' }}>
                        {l.finders_fee_open ? 'Open' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 10px' }}><span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(74,88,128,0.2)', color: 'var(--kb-text-secondary)', borderRadius: '4px' }}>{l.outreach_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'sellers' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>{['Business', 'Owner', 'Phone', 'Industry', 'State', 'Score', 'Est. Value', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid var(--kb-border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {sellerLeads.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                    <td style={{ padding: '11px 10px', fontWeight: 510, whiteSpace: 'nowrap' }}>{l.business_name}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', whiteSpace: 'nowrap' }}>{l.owner_name || '—'}</td>
                    <td style={{ padding: '11px 10px' }}><CallButton phone={l.owner_phone} name={l.owner_name} /></td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', fontSize: '12px' }}>{l.industry}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)' }}>{l.state}</td>
                    <td style={{ padding: '11px 10px' }}><span style={{ color: l.sell_readiness_score >= 8 ? '#2ECC8B' : '#C9A84C', fontWeight: 600 }}>{l.sell_readiness_score}/10</span></td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>{l.estimated_value_range || '—'}</td>
                    <td style={{ padding: '11px 10px' }}><span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(74,88,128,0.2)', color: 'var(--kb-text-secondary)', borderRadius: '4px' }}>{l.outreach_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'history' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>{['Date', 'Type', 'Seller Leads', 'Buyer Leads', 'Cost', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: 'var(--kb-text-secondary)', fontWeight: 510, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid var(--kb-border-subtle)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {runHistory.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--kb-text-muted)', fontSize: '13px' }}>No runs yet</td></tr>
                ) : runHistory.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-text-secondary)' }}>{new Date(r.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ padding: '11px 10px' }}>{r.run_type}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-green)' }}>{r.seller_leads_found ?? 0}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-green)' }}>{r.buyer_leads_found ?? 0}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--kb-accent)', fontFamily: "'DM Mono', monospace" }}>${r.total_cost_usd?.toFixed(2) ?? '—'}</td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                        background: r.status === 'complete' ? 'rgba(46,204,139,0.1)' : r.status === 'running' || r.status === 'requested' ? 'rgba(201,168,76,0.1)' : 'rgba(232,73,73,0.1)',
                        color: r.status === 'complete' ? '#2ECC8B' : r.status === 'running' || r.status === 'requested' ? '#C9A84C' : '#E87373',
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* ── PERF TAB ── */
            <PerfDashboard
              live={perfLive}
              reports={perfReports}
              loading={perfLoading}
              expanded={expandedReport}
              onExpand={setExpandedReport}
              onRefresh={loadPerf}
            />
          )}
        </div>
      </div>
    </div>
  )
}
