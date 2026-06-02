// ChiroPillar · Intake Submissions Dashboard
// Server component. Reads from chiropillar_targets via service-role.
// Auth is enforced in the parent (dashboard)/layout.tsx, so by the time
// this renders the user is already on the chiropillar_team whitelist
// OR holds a demo session cookie (read-only sample data).

import { cookies } from 'next/headers'
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

// Five sample applications shown when the visitor is in demo mode
// (no magic-link login). Numbers are realistic per the N=102 comp set.
const DEMO_TARGETS: Target[] = [
  {
    id: 'demo-1', full_name: 'Dr. Jane Rivera', email: 'jane@riverachiro.com', phone: '512-555-0143',
    practice_name: 'Rivera Chiropractic',  city: 'Austin', state: 'TX',
    gross_revenue_last_year: '$1.1M', net_revenue_last_year: '$420K',
    new_patients_per_month_avg_2yr: '65', avg_visits_per_patient: '26',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Rehab / corrective exercise'],
    employee_count: '6', geographic_location_notes: '12 yrs in business · 2nd loc opening Q3',
    owner_role: 'mostly_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ["Hits Wagner's 40+/mo new-patient floor.", 'Retention strong (26 visit avg).', 'Revenue base supports medical team.'],
    outreach_status: 'scheduled', created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'demo-2', full_name: 'Dr. Michael Chen', email: 'mchen@pacificspine.com', phone: '619-555-0177',
    practice_name: 'Pacific Spine Center', city: 'San Diego', state: 'CA',
    gross_revenue_last_year: '$850K', net_revenue_last_year: '$315K',
    new_patients_per_month_avg_2yr: '48', avg_visits_per_patient: '22',
    services_provided: ['Adjustments (manual)', 'Cold laser / low-level laser', 'X-ray on-site'],
    employee_count: '4', geographic_location_notes: '8 yrs in business · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ["Hits Wagner's 40+/mo new-patient floor.", 'Retention in the strong band.'],
    outreach_status: 'called', created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'demo-3', full_name: 'Dr. Sarah Kim', email: 'skim@apexwellness.com', phone: '602-555-0192',
    practice_name: 'Apex Wellness', city: 'Phoenix', state: 'AZ',
    gross_revenue_last_year: '$580K', net_revenue_last_year: '$210K',
    new_patients_per_month_avg_2yr: '32', avg_visits_per_patient: '18',
    services_provided: ['Adjustments (manual)', 'Massage therapy', 'Supplements / orthotics retail'],
    employee_count: '3', geographic_location_notes: '5 yrs in business',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'maybe',
    qualification_reasons: ['New-patient volume below the 40/mo target.', 'Owner is still full clinical — needs runway to step out.'],
    outreach_status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
  {
    id: 'demo-4', full_name: 'Dr. Robert Hayes', email: 'rhayes@mountainchiro.com', phone: '720-555-0211',
    practice_name: 'Mountain Chiropractic', city: 'Denver', state: 'CO',
    gross_revenue_last_year: '$1.4M', net_revenue_last_year: '$510K',
    new_patients_per_month_avg_2yr: '72', avg_visits_per_patient: '24',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Personal injury (PI) cases', 'Sports / extremity adjusting'],
    employee_count: '9', geographic_location_notes: '18 yrs in business · 3 associates',
    owner_role: 'wants_to_step_out', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ["Hits Wagner's 40+/mo new-patient floor.", 'Retention in the strong band.', 'Owner ready to step out — clean handoff.', 'Revenue base supports medical team.'],
    outreach_status: 'in_diligence', created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'demo-5', full_name: 'Dr. Lisa Park', email: 'lpark@harmonyspinal.com', phone: '704-555-0148',
    practice_name: 'Harmony Spinal', city: 'Charlotte', state: 'NC',
    gross_revenue_last_year: '$320K', net_revenue_last_year: '$95K',
    new_patients_per_month_avg_2yr: '18', avg_visits_per_patient: '14',
    services_provided: ['Adjustments (manual)'],
    employee_count: '1', geographic_location_notes: '3 yrs in business · solo',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'not_yet',
    qualification_reasons: ['New-patient volume below the 20/mo floor needed for the medical-team economics to work.'],
    outreach_status: 'passed', created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
]

async function loadTargets(): Promise<Target[]> {
  // Demo session → return sample data, do NOT hit the live database
  const jar = await cookies()
  if (jar.get('chiropillar-demo')?.value === '1') return DEMO_TARGETS

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
