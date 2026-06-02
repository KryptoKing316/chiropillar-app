// ChiroPillar · Intake Submissions Dashboard
// Server component. Reads from chiropillar_targets via service-role.
// Auth is enforced in the parent (dashboard)/layout.tsx, so by the time
// this renders the user is already on the chiropillar_team whitelist.

import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Target = {
  id: string
  full_name: string
  email: string
  phone: string | null
  practice_name: string
  city: string | null
  state: string | null
  gross_revenue_last_year: string | null
  net_revenue_last_year: string | null
  new_patients_per_month_avg_2yr: string | null
  avg_visits_per_patient: string | null
  services_provided: string[] | null
  employee_count: string | null
  geographic_location_notes: string | null
  owner_role: string | null
  past_12mo_was_spike: string | null
  qualification: string | null
  qualification_reasons: string[] | null
  outreach_status: string | null
  created_at: string
}

async function loadTargets(): Promise<Target[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return []
  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    return (data ?? []) as Target[]
  } catch {
    return []
  }
}

const QUAL_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  qualified: { bg: 'rgba(46,204,139,0.15)', color: '#1A9E66', border: 'rgba(46,204,139,0.40)', label: '✓ Qualified' },
  maybe:     { bg: 'rgba(201,168,76,0.15)', color: '#8B6914',  border: 'rgba(201,168,76,0.40)', label: '◐ Maybe'  },
  not_yet:   { bg: 'rgba(155,168,192,0.15)', color: '#5A6884', border: 'rgba(155,168,192,0.40)', label: '◯ Not yet' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  new:           { bg: 'rgba(46,117,182,0.12)', color: '#2E75B6' },
  called:        { bg: 'rgba(201,168,76,0.12)', color: '#C9A84C' },
  scheduled:     { bg: 'rgba(156,196,228,0.20)', color: '#2E75B6' },
  in_diligence:  { bg: 'rgba(201,168,76,0.18)', color: '#8B6914' },
  offer:         { bg: 'rgba(46,204,139,0.18)', color: '#1A9E66' },
  closed:        { bg: 'rgba(46,204,139,0.25)', color: '#1A9E66' },
  passed:        { bg: 'rgba(231,76,60,0.12)', color: '#E74C3C' },
}

export default async function TargetsPage() {
  const targets = await loadTargets()

  const counts = {
    total: targets.length,
    qualified: targets.filter(t => t.qualification === 'qualified').length,
    maybe: targets.filter(t => t.qualification === 'maybe').length,
    not_yet: targets.filter(t => t.qualification === 'not_yet').length,
  }

  return (
    <div style={{ padding: '32px 32px 80px', background: 'var(--kb-bg)', minHeight: '100vh', color: 'var(--kb-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: 'var(--cp-globe, #9CC4E4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          ChiroPillar · Pipeline
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 700, color: 'var(--kb-text)', margin: 0, letterSpacing: '-0.02em' }}>
          Intake Submissions
        </h1>
        <p style={{ color: 'var(--kb-text-secondary)', fontSize: 14, marginTop: 6 }}>Every chiropractor who&apos;s applied via the /intake form. Score is auto-computed against Wagner&apos;s qualification criteria.</p>
      </div>

      {/* Stat strip — collapses to 2×2 on tablet + single col on phone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Total submissions" value={counts.total} accent="#2E75B6" />
        <StatCard label="Qualified" value={counts.qualified} accent="#2ECC8B" />
        <StatCard label="Maybe" value={counts.maybe} accent="#C9A84C" />
        <StatCard label="Not yet" value={counts.not_yet} accent="#9BA8C0" />
      </div>

      {/* Table · horizontal scroll on narrow screens */}
      {targets.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12 }}>
        <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: 12, overflow: 'hidden', minWidth: 980 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1.4fr 80px 100px 120px 120px 110px 110px',
            gap: 12,
            padding: '14px 22px',
            background: 'var(--kb-table-header)',
            borderBottom: '1px solid var(--kb-border)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--kb-text-secondary)',
            fontWeight: 600,
          }}>
            <div>Chiropractor</div>
            <div>Practice</div>
            <div style={{ textAlign: 'right' }}>New/mo</div>
            <div style={{ textAlign: 'right' }}>Retention</div>
            <div style={{ textAlign: 'right' }}>Gross Rev</div>
            <div>Verdict</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Received</div>
          </div>

          {targets.map((t, i) => {
            const qual = t.qualification || 'not_yet'
            const qStyle = QUAL_STYLES[qual] || QUAL_STYLES.not_yet
            const sStyle = STATUS_STYLES[t.outreach_status || 'new'] || STATUS_STYLES.new
            return (
              <div key={t.id} style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.4fr 80px 100px 120px 120px 110px 110px',
                gap: 12,
                padding: '16px 22px',
                background: i % 2 ? 'var(--kb-row-alt)' : 'transparent',
                borderBottom: '1px solid var(--kb-border-subtle)',
                fontSize: 14,
                alignItems: 'center',
                color: 'var(--kb-text)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--kb-text)' }}>{t.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--kb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>{t.email}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--kb-text)' }}>{t.practice_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--kb-text-secondary)' }}>{[t.city, t.state].filter(Boolean).join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--kb-text)', fontWeight: 600 }}>
                  {t.new_patients_per_month_avg_2yr || '—'}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--kb-text)' }}>
                  {t.avg_visits_per_patient ? `${t.avg_visits_per_patient}v` : '—'}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--kb-text-secondary)', fontSize: 13 }}>
                  {t.gross_revenue_last_year || '—'}
                </div>
                <div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px',
                    background: qStyle.bg, color: qStyle.color,
                    border: `1px solid ${qStyle.border}`,
                    borderRadius: 6, fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700, letterSpacing: '0.08em',
                  }}>{qStyle.label}</span>
                </div>
                <div>
                  <span style={{
                    display: 'inline-block', padding: '3px 9px',
                    background: sStyle.bg, color: sStyle.color,
                    borderRadius: 4, fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700, letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}>{t.outreach_status || 'new'}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--kb-text-secondary)' }}>
                  {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{
      background: 'var(--kb-bg-panel)',
      border: '1px solid var(--kb-border)',
      borderRadius: 10,
      padding: '20px 22px',
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--kb-text-secondary)', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: accent, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      padding: '60px 40px',
      background: 'var(--kb-bg-panel)',
      border: '1px dashed var(--kb-border)',
      borderRadius: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: 'var(--kb-text)', margin: '0 0 8px' }}>No submissions yet</h2>
      <p style={{ color: 'var(--kb-text-secondary)', fontSize: 14, maxWidth: 520, margin: '0 auto 18px' }}>
        Once chiropractors start filling out the application at <strong>/intake</strong>, their entries will appear here with auto-scored qualification verdicts.
      </p>
      <a href="/intake" style={{
        display: 'inline-block',
        padding: '10px 22px',
        background: 'var(--cp-align, #2E75B6)',
        color: 'white', borderRadius: 7, textDecoration: 'none',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
      }}>View Public Intake Form →</a>
    </div>
  )
}
