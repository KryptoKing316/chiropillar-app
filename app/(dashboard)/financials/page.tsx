'use client'
import { Suspense, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DEMO_FINANCIALS, DEMO_ADDBACKS } from '@/lib/demo-data'
import PlaidConnect from '@/components/dashboard/PlaidConnect'
import QboConnect from '@/components/dashboard/QboConnect'

const DEMO_DEAL_ID = 'demo-001'

function fmt(n: number) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K'
  return '$' + n
}

function trend(rows: typeof DEMO_FINANCIALS, key: keyof typeof DEMO_FINANCIALS[0]) {
  if (rows.length < 2) return '—'
  const first = rows[0][key] as number
  const last  = rows[rows.length - 1][key] as number
  if (last > first) return '↑ Growing'
  if (last < first) return '↓ Declining'
  return '→ Stable'
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--kb-bg-surface)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginBottom: '5px' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontSize: '13px', color: p.color, fontWeight: 500 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  )
}

export default function FinancialsPage() {
  const [financials, setFinancials]   = useState(DEMO_FINANCIALS)
  const [addbacks, setAddbacks]       = useState(DEMO_ADDBACKS)
  const [dataSource, setDataSource]   = useState<'live' | 'demo'>('demo')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    fetch(`/api/financials?deal_id=${DEMO_DEAL_ID}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.rows?.length > 0) {
          // Shape live data to match chart format
          const rows = data.rows.map((r: any) => ({
            year:               r.year,
            gross_revenue:      r.gross_revenue      ?? 0,
            ebitda:             r.ebitda             ?? 0,
            normalized_ebitda:  r.normalized_ebitda  ?? 0,
            owner_compensation: r.owner_compensation ?? 0,
          }))
          setFinancials(rows)

          // Flatten all add_backs arrays from all years
          const allAddbacks = data.rows.flatMap((r: any) =>
            Array.isArray(r.add_backs) ? r.add_backs : []
          )
          if (allAddbacks.length > 0) setAddbacks(allAddbacks)

          setDataSource('live')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalAB = addbacks.reduce((s, a) => s + a.amount, 0)
  const years   = financials.map(f => f.year)

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--kb-text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Financial Analysis</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, margin: '0 0 5px', letterSpacing: '-0.3px' }}>Three-Year Financial Review</h1>
          <p style={{ fontSize: '14px', color: 'var(--kb-text-secondary)', margin: '0 0 22px' }}>
            {dataSource === 'live'
              ? 'Extracted by the KB Deal Intelligence Engine from your uploaded tax returns, P&Ls, and bank statements.'
              : 'Demo data shown, upload your documents to see your live financial analysis.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 590, letterSpacing: '0.08em', textTransform: 'uppercase',
            background: dataSource === 'live' ? 'rgba(46,204,139,0.12)' : 'rgba(201,168,76,0.1)',
            color:      dataSource === 'live' ? '#2ECC8B'              : '#C9A84C',
            border:     dataSource === 'live' ? '1px solid rgba(46,204,139,0.3)' : '1px solid rgba(201,168,76,0.25)',
          }}>
            {loading ? '…' : dataSource === 'live' ? '● Live Data' : '◎ Demo Data'}
          </span>
        </div>
      </div>

      {/* ── Connect Data Sources (NEW) ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          color: '#C9A84C',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Connect Live Financial Data
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '14px',
        }}>
          <Suspense fallback={<div style={{ padding: '24px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '12px' }}>Loading bank connector…</div>}>
            <PlaidConnect dealId={DEMO_DEAL_ID} />
          </Suspense>
          <Suspense fallback={<div style={{ padding: '24px', background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '12px' }}>Loading QBO connector…</div>}>
            <QboConnect dealId={DEMO_DEAL_ID} />
          </Suspense>
        </div>
      </div>

      {/* Revenue Chart */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '18px' }}>Annual Revenue ({years[0]}–{years[years.length - 1]})</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={financials} margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" stroke="var(--kb-text-muted)" tick={{ fontSize: 12, fill: 'var(--kb-text-secondary)' }} />
            <YAxis stroke="var(--kb-text-muted)" tick={{ fontSize: 12, fill: 'var(--kb-text-secondary)' }} tickFormatter={v => '$' + (v / 1000000).toFixed(1) + 'M'} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(201,168,76,0.06)', radius: 6 }} />
            <Bar dataKey="gross_revenue" name="Revenue" fill="#C9A84C" radius={[5, 5, 0, 0]} activeBar={{ fill: '#D4B060' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EBITDA Chart */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '18px' }}>EBITDA vs Normalized EBITDA</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={financials} margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" stroke="var(--kb-text-muted)" tick={{ fontSize: 12, fill: 'var(--kb-text-secondary)' }} />
            <YAxis stroke="var(--kb-text-muted)" tick={{ fontSize: 12, fill: 'var(--kb-text-secondary)' }} tickFormatter={v => '$' + Math.round(v / 1000) + 'K'} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(201,168,76,0.06)', radius: 6 }} />
            <Legend wrapperStyle={{ color: 'var(--kb-text-secondary)', fontSize: '12px' }} />
            <Bar dataKey="ebitda"            name="Reported EBITDA"   fill="rgba(201,168,76,0.55)" radius={[4, 4, 0, 0]} activeBar={{ fill: 'rgba(201,168,76,0.75)' }} />
            <Bar dataKey="normalized_ebitda" name="Normalized EBITDA" fill="#2ECC8B"               radius={[4, 4, 0, 0]} activeBar={{ fill: '#3DDDA0' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YoY Table */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 510, marginBottom: '16px' }}>Year-over-Year Comparison</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Metric', ...years.map(String), 'Trend'].map(h => (
                <th key={h} style={{ textAlign: h === 'Metric' ? 'left' : 'right', padding: '8px 12px', fontSize: '10px', fontWeight: 510, color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(201,168,76,0.18)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Gross Revenue',      key: 'gross_revenue'      as const },
              { label: 'Reported EBITDA',    key: 'ebitda'             as const },
              { label: 'Normalized EBITDA',  key: 'normalized_ebitda'  as const },
              { label: 'Owner Compensation', key: 'owner_compensation' as const },
            ].map(row => (
              <tr key={row.label} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>{row.label}</td>
                {financials.map(y => (
                  <td key={y.year} style={{ padding: '12px', textAlign: 'right', color: 'var(--kb-text-secondary)', fontFamily: "'DM Mono', monospace" }}>{fmt(y[row.key])}</td>
                ))}
                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--kb-green)', fontWeight: 500 }}>{trend(financials, row.key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add-backs */}
      <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>KB Deal Intelligence, Add-Backs Found</div>
            <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '2px' }}>Items added back to EBITDA to reflect true earnings power</div>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--kb-green)' }}>+{fmt(totalAB)}</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['Add-Back Item', 'Amount', 'Reason'].map(h => (
                <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '8px 12px', fontSize: '10px', fontWeight: 510, color: 'var(--kb-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(201,168,76,0.18)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {addbacks.map((a, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--kb-border-subtle)' }}>
                <td style={{ padding: '12px' }}>{a.description}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--kb-green)', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>+{fmt(a.amount)}</td>
                <td style={{ padding: '12px', color: 'var(--kb-text-secondary)', fontSize: '12px' }}>{a.reason}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(46,204,139,0.06)', borderTop: '1px solid rgba(46,204,139,0.2)' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Total Add-Backs</td>
              <td style={{ padding: '12px', textAlign: 'right', color: 'var(--kb-green)', fontWeight: 590, fontFamily: "'DM Mono', monospace", fontSize: '15px' }}>+{fmt(totalAB)}</td>
              <td style={{ padding: '12px', color: 'var(--kb-text-secondary)', fontSize: '12px' }}>
                {fmt(financials[financials.length - 1]?.ebitda ?? 0)} reported → {fmt((financials[financials.length - 1]?.ebitda ?? 0) + totalAB)} normalized
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
