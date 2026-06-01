'use client'
import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CIMExportButton({ cimData, cimId }: { cimData: Record<string, any>; cimId?: string }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cim/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cim_data: cimData, cim_id: cimId }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const headline = cimData?.executive_summary?.headline || 'CIM'
      a.download = `${headline.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}_KB_CIM.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF export failed. Please try again.')
    }
    setLoading(false)
  }

  const handlePrint = () => {
    const html = buildPrintHTML(cimData)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 600)
  }

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button
        onClick={handlePrint}
        style={{
          padding: '11px 20px',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '10px',
          color: '#C9A84C',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🖨 Print / Save PDF
      </button>

      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          padding: '11px 20px',
          background: loading ? 'rgba(201,168,76,0.4)' : '#C9A84C',
          border: 'none',
          borderRadius: '10px',
          color: '#0B1B3E',
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background 0.2s',
        }}
      >
        {loading ? '⏳ Generating…' : '⬇ Download PDF'}
      </button>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrintHTML(cim: Record<string, any>): string {
  const es = cim.executive_summary || {}
  const bo = cim.business_overview || {}
  const fs = cim.financial_summary || {}
  const ma = cim.market_analysis || {}
  const ops = cim.operations || {}
  const growth = cim.growth_opportunities || []
  const ds = cim.deal_structure || {}
  const ih = cim.investment_highlights || []

  const metrics = es.key_metrics || {}

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${es.headline || 'Confidential Information Memorandum'} — Kingdom Broker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a2e; font-size: 11pt; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
  h1.headline { font-family: 'Playfair Display', serif; font-size: 22pt; color: #0B1B3E; margin-bottom: 18px; line-height: 1.3; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 14pt; color: #C9A84C; font-weight: 700; border-bottom: 2px solid #C9A84C; padding-bottom: 6px; margin-bottom: 14px; }
  .label { font-size: 8pt; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; font-weight: 600; }
  .value { font-size: 10.5pt; color: #1a1a2e; margin-bottom: 12px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0; }
  .metric-box { background: #f5f5f0; border-radius: 8px; padding: 10px 12px; }
  .metric-val { font-size: 14pt; color: #C9A84C; font-weight: 700; font-family: 'Playfair Display', serif; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 14px; }
  th { background: #0B1B3E; color: #C9A84C; padding: 8px 10px; text-align: left; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; color: #1a1a2e; }
  tr:nth-child(even) td { background: #fafaf8; }
  .highlight { background: #f0faf5; border: 1px solid #2ECC8B; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
  .highlight-val { font-size: 16pt; color: #1a8a5a; font-weight: 700; font-family: 'Playfair Display', serif; }
  .ih-item { display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
  .ih-diamond { color: #C9A84C; flex-shrink: 0; }
  .growth-item { border: 1px solid #dde; border-left: 4px solid #2ECC8B; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; }
  .growth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
  .confidential-header { background: #fff8e7; border: 1px solid #C9A84C; border-radius: 8px; padding: 8px 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .confidential-badge { font-size: 9pt; font-weight: 700; color: #C9A84C; letter-spacing: 0.15em; text-transform: uppercase; }
  .footer { border-top: 1px solid #ddd; padding-top: 14px; margin-top: 28px; font-size: 8pt; color: #999; text-align: center; line-height: 1.7; }
  @media print {
    body { font-size: 10pt; }
    .page { padding: 24px 32px; }
    h1.headline { font-size: 18pt; }
    .section-title { font-size: 12pt; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="confidential-header">
    <span class="confidential-badge">Confidential Information Memorandum</span>
    <span style="font-size:8pt;color:#aaa;">Kingdom Broker Inc. · NDA Required</span>
  </div>

  ${es.headline ? `<h1 class="headline">${es.headline}</h1>` : ''}

  <div class="section">
    <div class="section-title">Executive Summary</div>
    ${es.what ? `<div class="label">What</div><div class="value">${es.what}</div>` : ''}
    ${es.why ? `<div class="label">Investment Thesis</div><div class="value">${es.why}</div>` : ''}
    ${Object.keys(metrics).length > 0 ? `
    <div class="metrics-grid">
      ${Object.entries(metrics).filter(([, v]) => v).map(([k, v]) => `
        <div class="metric-box">
          <div class="label">${k.replace(/_/g, ' ')}</div>
          <div class="metric-val">${String(v)}</div>
        </div>
      `).join('')}
    </div>` : ''}
  </div>

  ${ih.length > 0 ? `
  <div class="section">
    <div class="section-title">Investment Highlights</div>
    ${ih.map((h: string) => `
      <div class="ih-item">
        <span class="ih-diamond">◆</span>
        <span>${h}</span>
      </div>
    `).join('')}
  </div>` : ''}

  ${fs.income_statement?.length ? `
  <div class="section">
    <div class="section-title">Financial Summary</div>
    <table>
      <thead><tr>
        <th>Year</th><th>Revenue</th><th>Gross Profit</th><th>Gross Margin</th>
        <th>EBITDA</th><th>EBITDA Margin</th><th>Net Income</th>
      </tr></thead>
      <tbody>
        ${fs.income_statement.map((r: Record<string, string>) => `
          <tr>
            <td><strong>${r.year}</strong></td>
            <td>${r.revenue || ''}</td><td>${r.gross_profit || ''}</td>
            <td>${r.gross_margin || ''}</td><td>${r.ebitda || ''}</td>
            <td>${r.ebitda_margin || ''}</td><td>${r.net_income || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${fs.add_backs?.length ? `
    <div class="label" style="margin-bottom:8px;">EBITDA Add-Backs / Normalizations</div>
    <table>
      <thead><tr><th>Description</th><th>Amount</th><th>Reason</th></tr></thead>
      <tbody>
        ${fs.add_backs.map((ab: Record<string, string>) => `
          <tr>
            <td>${ab.description || ''}</td>
            <td style="color:#1a8a5a;font-weight:700;">${ab.amount || ''}</td>
            <td style="color:#666;">${ab.reason || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : ''}
    ${fs.normalized_ebitda ? `
    <div class="highlight">
      <div class="label">Normalized EBITDA</div>
      <div class="highlight-val">${fs.normalized_ebitda}</div>
    </div>` : ''}
    ${fs.valuation ? `
    <div style="background:#fff8e7;border:1px solid #C9A84C;border-radius:8px;padding:10px 14px;margin-top:8px;">
      <div class="label">Valuation Range</div>
      <div style="font-size:13pt;color:#C9A84C;font-weight:700;">${fs.valuation.low} – ${fs.valuation.high}</div>
      <div style="font-size:9pt;color:#888;margin-top:3px;">Asking: ${fs.valuation.asking_price} · ${fs.valuation.implied_multiple} implied</div>
    </div>` : ''}
  </div>` : ''}

  ${bo.history || bo.products_services ? `
  <div class="section">
    <div class="section-title">Business Overview</div>
    ${bo.history ? `<div class="label">Company History</div><div class="value">${bo.history}</div>` : ''}
    ${bo.products_services ? `<div class="label">Products & Services</div><div class="value">${bo.products_services}</div>` : ''}
    ${bo.go_to_market ? `<div class="label">Go-To-Market</div><div class="value">${bo.go_to_market}</div>` : ''}
    ${bo.management_team ? `<div class="label">Management Team</div><div class="value">${bo.management_team}</div>` : ''}
  </div>` : ''}

  ${ops.customer_summary || ops.operations_overview ? `
  <div class="section">
    <div class="section-title">Operations</div>
    ${ops.customer_summary ? `<div class="label">Customer Summary</div><div class="value">${ops.customer_summary}</div>` : ''}
    ${ops.operations_overview ? `<div class="label">Operations Overview</div><div class="value">${ops.operations_overview}</div>` : ''}
    ${ops.supplier_relationships ? `<div class="label">Supplier Relationships</div><div class="value">${ops.supplier_relationships}</div>` : ''}
    ${ops.employees?.length ? `
    <table style="margin-top:10px;">
      <thead><tr><th>Role</th><th>Count</th><th>Avg Tenure</th><th>Notes</th></tr></thead>
      <tbody>
        ${ops.employees.map((e: Record<string, string>) => `
          <tr>
            <td><strong>${e.role || ''}</strong></td>
            <td>${e.count || ''}</td>
            <td>${e.tenure || ''}</td>
            <td style="color:#666;">${e.notes || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : ''}
  </div>` : ''}

  ${growth.length ? `
  <div class="section">
    <div class="section-title">Growth Opportunities</div>
    ${growth.map((g: Record<string, string>, i: number) => `
      <div class="growth-item">
        <strong>${i + 1}. ${g.name || ''}</strong>
        <div class="growth-grid">
          ${g.current_state ? `<div><div class="label">Current State</div><div style="font-size:9.5pt;color:#555;">${g.current_state}</div></div>` : ''}
          ${g.opportunity ? `<div><div class="label">Opportunity</div><div style="font-size:9.5pt;color:#555;">${g.opportunity}</div></div>` : ''}
          ${g.revenue_impact ? `<div><div class="label">Revenue Impact</div><div style="font-size:9.5pt;color:#555;">${g.revenue_impact}</div></div>` : ''}
          ${g.timeline ? `<div><div class="label">Timeline</div><div style="font-size:9.5pt;color:#555;">${g.timeline}</div></div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>` : ''}

  ${ma.industry_overview || ma.competitive_landscape ? `
  <div class="section">
    <div class="section-title">Market Analysis</div>
    ${ma.industry_overview ? `<div class="label">Industry Overview</div><div class="value">${ma.industry_overview}</div>` : ''}
    ${ma.competitive_landscape ? `<div class="label">Competitive Landscape</div><div class="value">${ma.competitive_landscape}</div>` : ''}
    ${ma.barriers_to_entry?.length ? `
    <div class="label">Barriers to Entry</div>
    ${ma.barriers_to_entry.map((b: string) => `
      <div class="ih-item">
        <span class="ih-diamond">◆</span>
        <span style="font-size:9.5pt;color:#555;">${b}</span>
      </div>
    `).join('')}` : ''}
  </div>` : ''}

  ${ds.transaction_overview ? `
  <div class="section">
    <div class="section-title">Deal Structure & Transaction Overview</div>
    ${ds.transaction_overview ? `<div class="label">Transaction Overview</div><div class="value">${ds.transaction_overview}</div>` : ''}
    ${ds.preferred_structure ? `<div class="label">Preferred Structure</div><div class="value">${ds.preferred_structure}</div>` : ''}
    ${ds.transition_plan ? `<div class="label">Transition Plan</div><div class="value">${ds.transition_plan}</div>` : ''}
    ${ds.timing ? `<div class="label">Timing</div><div class="value">${ds.timing}</div>` : ''}
  </div>` : ''}

  <div class="footer">
    CONFIDENTIAL — This document is prepared by Kingdom Broker Inc. and is intended solely for the use of the recipient.<br/>
    Distribution or reproduction without written consent is prohibited. Kingdom Broker Inc. · Plano, Texas · KingdomBroker.com
  </div>
</div>
</body>
</html>`
}
