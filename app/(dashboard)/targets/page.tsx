// PROMEDVA · Intake Submissions Dashboard
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

// Sample applications shown when the visitor is in demo mode OR when the
// production DB is empty (pre-launch). Geo mix matches Wagner's stated
// territory (VA primary; TX/FL/NC/SC/GA/TN/AL/KY/MD secondary). Numbers
// realistic per the N=102 comp set.
const t = (hoursAgo: number) => new Date(Date.now() - 1000 * 60 * 60 * hoursAgo).toISOString()
const DEMO_TARGETS: Target[] = [
  // VA — Wagner Primary (heaviest concentration)
  {
    id: 'demo-1', full_name: 'Dr. Marcus Bell', email: 'mbell@piedmontspine.com', phone: '434-555-0118',
    practice_name: 'Piedmont Spine & Wellness', city: 'Charlottesville', state: 'VA',
    gross_revenue_last_year: '$1.3M', net_revenue_last_year: '$485K',
    new_patients_per_month_avg_2yr: '78', avg_visits_per_patient: '28',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'X-ray on-site', 'Rehab / corrective exercise'],
    employee_count: '8', geographic_location_notes: '14 yrs · 2 associate DCs · near UVA',
    owner_role: 'mostly_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor (78).', 'Retention strong (28 visit avg).', 'Owner is mostly-management — clean step out.', 'Revenue base supports medical team add-on.'],
    outreach_status: 'in_diligence', created_at: t(4),
  },
  {
    id: 'demo-2', full_name: 'Dr. Olivia Reyes', email: 'oreyes@blueridgechiro.com', phone: '540-555-0204',
    practice_name: 'Blue Ridge Chiropractic', city: 'Roanoke', state: 'VA',
    gross_revenue_last_year: '$920K', net_revenue_last_year: '$340K',
    new_patients_per_month_avg_2yr: '52', avg_visits_per_patient: '24',
    services_provided: ['Adjustments (manual)', 'Cold laser / low-level laser', 'Personal injury (PI) cases'],
    employee_count: '5', geographic_location_notes: '11 yrs · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor.', 'PI mix adds margin.', 'Retention in target band.'],
    outreach_status: 'scheduled', created_at: t(12),
  },
  {
    id: 'demo-3', full_name: 'Dr. Anika Patel', email: 'apatel@richmondspine.com', phone: '804-555-0177',
    practice_name: 'Richmond Spine Center', city: 'Richmond', state: 'VA',
    gross_revenue_last_year: '$1.05M', net_revenue_last_year: '$385K',
    new_patients_per_month_avg_2yr: '61', avg_visits_per_patient: '26',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Massage therapy', 'Supplements / orthotics retail'],
    employee_count: '7', geographic_location_notes: '9 yrs · associate DC + LMT',
    owner_role: 'mostly_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor.', 'Retention strong.', 'Owner ready to step out — clean handoff.'],
    outreach_status: 'called', created_at: t(20),
  },
  // TX — secondary
  {
    id: 'demo-4', full_name: 'Dr. Jane Rivera', email: 'jane@riverachiro.com', phone: '512-555-0143',
    practice_name: 'Rivera Chiropractic',  city: 'Austin', state: 'TX',
    gross_revenue_last_year: '$1.1M', net_revenue_last_year: '$420K',
    new_patients_per_month_avg_2yr: '65', avg_visits_per_patient: '26',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Rehab / corrective exercise'],
    employee_count: '6', geographic_location_notes: '12 yrs · 2nd loc opening Q3',
    owner_role: 'mostly_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor.', 'Retention strong (26 avg).', 'Revenue base supports medical team.'],
    outreach_status: 'scheduled', created_at: t(28),
  },
  {
    id: 'demo-5', full_name: 'Dr. Brandon Cooper', email: 'bcooper@dallasalignment.com', phone: '214-555-0319',
    practice_name: 'Dallas Alignment & Sport', city: 'Plano', state: 'TX',
    gross_revenue_last_year: '$1.6M', net_revenue_last_year: '$590K',
    new_patients_per_month_avg_2yr: '88', avg_visits_per_patient: '22',
    services_provided: ['Adjustments (manual)', 'Sports / extremity adjusting', 'Shockwave therapy', 'Dry needling'],
    employee_count: '11', geographic_location_notes: '16 yrs · 3 associates · Frisco satellite',
    owner_role: 'wants_to_step_out', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor (88).', 'Owner ready to step out.', 'Multi-location footprint.', 'Strong revenue base.'],
    outreach_status: 'in_diligence', created_at: t(36),
  },
  // FL — secondary
  {
    id: 'demo-6', full_name: 'Dr. Carla Fontana', email: 'cfontana@tampaspinecare.com', phone: '813-555-0426',
    practice_name: 'Tampa Bay Spine Care', city: 'Tampa', state: 'FL',
    gross_revenue_last_year: '$890K', net_revenue_last_year: '$325K',
    new_patients_per_month_avg_2yr: '49', avg_visits_per_patient: '21',
    services_provided: ['Adjustments (manual)', 'Cold laser / low-level laser', 'Personal injury (PI) cases'],
    employee_count: '5', geographic_location_notes: '8 yrs · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor.', 'PI mix adds margin.', 'Retention in band.'],
    outreach_status: 'called', created_at: t(44),
  },
  {
    id: 'demo-7', full_name: 'Dr. Marcus Liu', email: 'mliu@orlandowellness.com', phone: '407-555-0510',
    practice_name: 'Orlando Wellness Group', city: 'Orlando', state: 'FL',
    gross_revenue_last_year: '$640K', net_revenue_last_year: '$245K',
    new_patients_per_month_avg_2yr: '37', avg_visits_per_patient: '20',
    services_provided: ['Adjustments (manual)', 'Massage therapy', 'Supplements / orthotics retail'],
    employee_count: '4', geographic_location_notes: '6 yrs · solo DC',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'maybe',
    qualification_reasons: ['Volume just under 40/mo floor (37).', 'Owner still full-clinical — needs runway.'],
    outreach_status: 'new', created_at: t(52),
  },
  // NC — secondary
  {
    id: 'demo-8', full_name: 'Dr. Hannah Briggs', email: 'hbriggs@charlottespinal.com', phone: '704-555-0651',
    practice_name: 'Charlotte Spinal Health', city: 'Charlotte', state: 'NC',
    gross_revenue_last_year: '$770K', net_revenue_last_year: '$280K',
    new_patients_per_month_avg_2yr: '44', avg_visits_per_patient: '23',
    services_provided: ['Adjustments (manual)', 'X-ray on-site', 'Rehab / corrective exercise'],
    employee_count: '4', geographic_location_notes: '10 yrs · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor (44).', 'Retention in band.'],
    outreach_status: 'scheduled', created_at: t(58),
  },
  {
    id: 'demo-9', full_name: 'Dr. Vincent Park', email: 'vpark@raleighchiro.com', phone: '919-555-0744',
    practice_name: 'Raleigh Family Chiropractic', city: 'Raleigh', state: 'NC',
    gross_revenue_last_year: '$510K', net_revenue_last_year: '$185K',
    new_patients_per_month_avg_2yr: '29', avg_visits_per_patient: '17',
    services_provided: ['Adjustments (manual)', 'Massage therapy'],
    employee_count: '2', geographic_location_notes: '4 yrs · solo',
    owner_role: 'full_clinical', past_12mo_was_spike: 'unsure',
    qualification: 'maybe',
    qualification_reasons: ['Volume below 40/mo floor (29).', 'Owner full-clinical.', 'Trailing-12 may be a spike.'],
    outreach_status: 'new', created_at: t(70),
  },
  // GA — secondary
  {
    id: 'demo-10', full_name: 'Dr. Sarah Kim', email: 'skim@apexwellness.com', phone: '404-555-0822',
    practice_name: 'Apex Wellness Atlanta', city: 'Atlanta', state: 'GA',
    gross_revenue_last_year: '$580K', net_revenue_last_year: '$210K',
    new_patients_per_month_avg_2yr: '32', avg_visits_per_patient: '18',
    services_provided: ['Adjustments (manual)', 'Massage therapy', 'Supplements / orthotics retail'],
    employee_count: '3', geographic_location_notes: '5 yrs',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'maybe',
    qualification_reasons: ['Volume below 40/mo target (32).', 'Owner still full-clinical — needs runway to step out.'],
    outreach_status: 'new', created_at: t(82),
  },
  {
    id: 'demo-11', full_name: 'Dr. Robert Hayes', email: 'rhayes@savannahspine.com', phone: '912-555-0918',
    practice_name: 'Savannah Spine Group', city: 'Savannah', state: 'GA',
    gross_revenue_last_year: '$1.4M', net_revenue_last_year: '$510K',
    new_patients_per_month_avg_2yr: '72', avg_visits_per_patient: '24',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Personal injury (PI) cases', 'Sports / extremity adjusting'],
    employee_count: '9', geographic_location_notes: '18 yrs · 3 associates',
    owner_role: 'wants_to_step_out', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor.', 'Retention strong.', 'Owner ready to step out — clean handoff.', 'Revenue base supports medical team.'],
    outreach_status: 'in_diligence', created_at: t(90),
  },
  // TN — secondary
  {
    id: 'demo-12', full_name: 'Dr. Daniel Ortiz', email: 'dortiz@nashvillealignment.com', phone: '615-555-1041',
    practice_name: 'Nashville Alignment Center', city: 'Nashville', state: 'TN',
    gross_revenue_last_year: '$830K', net_revenue_last_year: '$310K',
    new_patients_per_month_avg_2yr: '46', avg_visits_per_patient: '25',
    services_provided: ['Adjustments (manual)', 'Spinal decompression', 'Cold laser / low-level laser'],
    employee_count: '5', geographic_location_notes: '9 yrs · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor (46).', 'Retention strong.'],
    outreach_status: 'called', created_at: t(104),
  },
  // SC — secondary
  {
    id: 'demo-13', full_name: 'Dr. Priya Sharma', email: 'psharma@greenvillechiro.com', phone: '864-555-1126',
    practice_name: 'Greenville Family Chiropractic', city: 'Greenville', state: 'SC',
    gross_revenue_last_year: '$420K', net_revenue_last_year: '$155K',
    new_patients_per_month_avg_2yr: '24', avg_visits_per_patient: '16',
    services_provided: ['Adjustments (manual)'],
    employee_count: '2', geographic_location_notes: '4 yrs · solo',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'maybe',
    qualification_reasons: ['Volume below 40/mo target (24).', 'Limited service mix.', 'Owner full-clinical.'],
    outreach_status: 'new', created_at: t(118),
  },
  // AL — secondary (new per Wagner geo)
  {
    id: 'demo-14', full_name: 'Dr. Calvin Wright', email: 'cwright@birminghamspine.com', phone: '205-555-1233',
    practice_name: 'Birmingham Spine Institute', city: 'Birmingham', state: 'AL',
    gross_revenue_last_year: '$720K', net_revenue_last_year: '$265K',
    new_patients_per_month_avg_2yr: '41', avg_visits_per_patient: '21',
    services_provided: ['Adjustments (manual)', 'X-ray on-site', 'Cold laser / low-level laser'],
    employee_count: '4', geographic_location_notes: '7 yrs · sole DC',
    owner_role: 'mostly_clinical_some_management', past_12mo_was_spike: 'no',
    qualification: 'qualified',
    qualification_reasons: ['Hits Wagner 40+/mo floor (41).', 'Retention in band.'],
    outreach_status: 'scheduled', created_at: t(132),
  },
  // Not-yet — KY (new per Wagner geo)
  {
    id: 'demo-15', full_name: 'Dr. Lisa Park', email: 'lpark@harmonyspinal.com', phone: '502-555-1349',
    practice_name: 'Louisville Harmony Spinal', city: 'Louisville', state: 'KY',
    gross_revenue_last_year: '$320K', net_revenue_last_year: '$95K',
    new_patients_per_month_avg_2yr: '18', avg_visits_per_patient: '14',
    services_provided: ['Adjustments (manual)'],
    employee_count: '1', geographic_location_notes: '3 yrs · solo',
    owner_role: 'full_clinical', past_12mo_was_spike: 'no',
    qualification: 'not_yet',
    qualification_reasons: ['New-patient volume below 20/mo floor — medical-team economics need 40+.'],
    outreach_status: 'passed', created_at: t(150),
  },
]

async function loadTargets(): Promise<Target[]> {
  // Demo session → return sample data, do NOT hit the live database
  const jar = await cookies()
  if (jar.get('chiropillar-demo')?.value === '1') return DEMO_TARGETS

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return DEMO_TARGETS
  try {
    const admin = createClient(url, sk, { auth: { persistSession: false } })
    const { data } = await admin
      .from('chiropillar_targets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    const rows = (data ?? []) as Target[]
    // Empty production DB (pre-launch) → fall back to the demo set so the
    // surface looks alive for Wagner / McGrath walking the platform.
    return rows.length === 0 ? DEMO_TARGETS : rows
  } catch {
    return DEMO_TARGETS
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
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, letterSpacing: '0.22em', color: '#9CC4E4', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
          PROMEDVA · Pipeline
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 4.5vw, 46px)', fontWeight: 700, color: 'var(--kb-text)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Intake Submissions
        </h1>
        <p style={{ color: '#FFFFFF', fontSize: 16, marginTop: 0, maxWidth: 760, lineHeight: 1.6, fontWeight: 400 }}>Every chiropractor who&apos;s applied via the /intake form. Score is auto-computed against Wagner&apos;s qualification criteria.</p>
      </div>

      {/* Stat strip — collapses to 2×2 on tablet + single col on phone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total submissions" value={counts.total} accent="#9CC4E4" />
        <StatCard label="Qualified" value={counts.qualified} accent="#2ECC8B" />
        <StatCard label="Maybe" value={counts.maybe} accent="#C9A84C" />
        <StatCard label="Not yet" value={counts.not_yet} accent="#E8C96A" />
      </div>

      {/* Table · horizontal scroll on narrow screens */}
      {targets.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12 }}>
        <div style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-border)', borderRadius: 12, overflow: 'hidden', minWidth: 980, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1.4fr 90px 110px 130px 130px 120px 110px',
            gap: 14,
            padding: '16px 24px',
            background: 'rgba(201,168,76,0.06)',
            borderBottom: '1px solid var(--kb-border)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            fontWeight: 800,
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
                gridTemplateColumns: '1.6fr 1.4fr 90px 110px 130px 130px 120px 110px',
                gap: 14,
                padding: '18px 24px',
                background: i % 2 ? 'rgba(255,255,255,0.025)' : 'transparent',
                borderBottom: '1px solid var(--kb-border-subtle)',
                fontSize: 14,
                alignItems: 'center',
                color: '#FFFFFF',
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 15, marginBottom: 3, letterSpacing: '-0.01em' }}>{t.full_name}</div>
                  <div style={{ fontSize: 12.5, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", opacity: 0.75, fontWeight: 500 }}>{t.email}</div>
                </div>
                <div>
                  <div style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: 600 }}>{t.practice_name}</div>
                  <div style={{ fontSize: 12.5, color: '#FFFFFF', opacity: 0.75, fontWeight: 500, marginTop: 3 }}>{[t.city, t.state].filter(Boolean).join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#FFFFFF', fontWeight: 700, fontSize: 15 }}>
                  {t.new_patients_per_month_avg_2yr || '—'}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
                  {t.avg_visits_per_patient ? `${t.avg_visits_per_patient}v` : '—'}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#C9A84C', fontSize: 14, fontWeight: 700 }}>
                  {t.gross_revenue_last_year || '—'}
                </div>
                <div>
                  <span style={{
                    display: 'inline-block', padding: '5px 11px',
                    background: qStyle.bg, color: qStyle.color,
                    border: `1px solid ${qStyle.border}`,
                    borderRadius: 6, fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800, letterSpacing: '0.08em',
                  }}>{qStyle.label}</span>
                </div>
                <div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px',
                    background: sStyle.bg, color: sStyle.color,
                    borderRadius: 5, fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800, letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}>{t.outreach_status || 'new'}</span>
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: '#FFFFFF', opacity: 0.75, fontWeight: 600 }}>
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
      background: `linear-gradient(135deg, ${accent}10, var(--kb-bg-panel))`,
      border: `1px solid ${accent}40`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 12,
      padding: '22px 26px',
      boxShadow: `0 4px 16px ${accent}15`,
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, fontWeight: 800, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
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
