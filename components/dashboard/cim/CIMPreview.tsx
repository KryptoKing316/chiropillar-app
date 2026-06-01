'use client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CIMPreview({ cim }: { cim: Record<string, any> }) {
  const { executive_summary: es, business_overview: bo, financial_summary: fs,
    market_analysis: ma, operations: ops, growth_opportunities: growth,
    deal_structure: ds, investment_highlights: ih } = cim

  const S = {
    section: {
      background: '#0D1F3C', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '28px 32px', marginBottom: '20px',
    } as React.CSSProperties,
    sectionTitle: {
      fontFamily: "'Playfair Display', serif", fontSize: '20px',
      color: '#C9A84C', fontWeight: 600, marginBottom: '18px',
      paddingBottom: '12px', borderBottom: '1px solid rgba(201,168,76,0.15)',
    } as React.CSSProperties,
    label: { fontSize: '11px', color: '#4A5880', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' },
    value: { fontSize: '15px', color: '#F2EEE7', lineHeight: 1.65, marginBottom: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
    th: { padding: '10px 14px', textAlign: 'left' as const, background: 'rgba(201,168,76,0.08)', color: '#C9A84C', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, borderBottom: '1px solid rgba(201,168,76,0.15)' },
    td: { padding: '10px 14px', color: '#F2EEE7', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    highlight: { background: 'rgba(46,204,139,0.07)', border: '1px solid rgba(46,204,139,0.2)', borderRadius: '10px', padding: '14px 18px', marginBottom: '10px' },
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: '#F2EEE7', maxWidth: '900px' }}>

      {/* Confidential Header */}
      <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '10px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Confidential Information Memorandum</span>
        <span style={{ fontSize: '11px', color: '#4A5880' }}>Kingdom Broker Inc. · NDA Required</span>
      </div>

      {/* Executive Summary */}
      {es && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Executive Summary</div>
          {es.headline && (
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#F2EEE7', marginBottom: '16px', lineHeight: 1.3 }}>{es.headline}</h2>
          )}
          {es.what && <><div style={S.label}>What</div><div style={S.value}>{es.what}</div></>}
          {es.why && <><div style={S.label}>Investment Thesis</div><div style={S.value}>{es.why}</div></>}

          {es.key_metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
              {Object.entries(es.key_metrics).map(([k, v]) => v ? (
                <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                  <div style={S.label}>{k.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '18px', color: '#C9A84C', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{String(v)}</div>
                </div>
              ) : null)}
            </div>
          )}
        </div>
      )}

      {/* Investment Highlights */}
      {ih && ih.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Investment Highlights</div>
          {ih.map((h: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <div style={{ color: '#C9A84C', fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>◆</div>
              <div style={{ fontSize: '15px', color: '#F2EEE7', lineHeight: 1.65 }}>{h}</div>
            </div>
          ))}
        </div>
      )}

      {/* Financial Summary */}
      {fs && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Financial Summary</div>

          {fs.income_statement && fs.income_statement.length > 0 && (
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Year', 'Revenue', 'Gross Profit', 'Gross Margin', 'EBITDA', 'EBITDA Margin', 'Net Income'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fs.income_statement.map((row: Record<string, string>, i: number) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: 600, color: '#C9A84C' }}>{row.year}</td>
                      <td style={S.td}>{row.revenue}</td>
                      <td style={S.td}>{row.gross_profit}</td>
                      <td style={S.td}>{row.gross_margin}</td>
                      <td style={S.td}>{row.ebitda}</td>
                      <td style={S.td}>{row.ebitda_margin}</td>
                      <td style={S.td}>{row.net_income}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {fs.add_backs && fs.add_backs.length > 0 && (
            <>
              <div style={{ ...S.label, marginBottom: '10px' }}>EBITDA Add-Backs / Normalizations</div>
              <table style={{ ...S.table, marginBottom: '16px' }}>
                <thead>
                  <tr>
                    {['Description', 'Amount', 'Reason'].map(h => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fs.add_backs.map((ab: Record<string, string>, i: number) => (
                    <tr key={i}>
                      <td style={S.td}>{ab.description}</td>
                      <td style={{ ...S.td, color: '#2ECC8B', fontWeight: 600 }}>{ab.amount}</td>
                      <td style={{ ...S.td, color: '#9BA8C0' }}>{ab.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {fs.normalized_ebitda && (
              <div style={S.highlight}>
                <div style={S.label}>Normalized EBITDA</div>
                <div style={{ fontSize: '22px', color: '#2ECC8B', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fs.normalized_ebitda}</div>
              </div>
            )}
            {fs.valuation && (
              <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '14px 18px' }}>
                <div style={S.label}>Valuation Range</div>
                <div style={{ fontSize: '16px', color: '#C9A84C', fontWeight: 600 }}>
                  {fs.valuation.low} – {fs.valuation.high}
                </div>
                <div style={{ fontSize: '13px', color: '#9BA8C0', marginTop: '4px' }}>Asking: {fs.valuation.asking_price} · {fs.valuation.implied_multiple} implied</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Overview */}
      {bo && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Business Overview</div>
          {bo.history && <><div style={S.label}>Company History</div><div style={S.value}>{bo.history}</div></>}
          {bo.products_services && <><div style={S.label}>Products & Services</div><div style={S.value}>{bo.products_services}</div></>}
          {bo.go_to_market && <><div style={S.label}>Go-To-Market</div><div style={S.value}>{bo.go_to_market}</div></>}
          {bo.management_team && <><div style={S.label}>Management Team</div><div style={S.value}>{bo.management_team}</div></>}

          {bo.revenue_by_service && bo.revenue_by_service.length > 0 && (
            <>
              <div style={S.label}>Revenue by Service</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {bo.revenue_by_service.map((s: { service: string; pct: string }, i: number) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 14px' }}>
                    <span style={{ color: '#F2EEE7', fontSize: '14px' }}>{s.service}</span>
                    <span style={{ color: '#C9A84C', fontWeight: 700, marginLeft: '8px', fontSize: '14px' }}>{s.pct}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Operations */}
      {ops && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Operations</div>
          {ops.customer_summary && <><div style={S.label}>Customer Summary</div><div style={S.value}>{ops.customer_summary}</div></>}
          {ops.operations_overview && <><div style={S.label}>Operations Overview</div><div style={S.value}>{ops.operations_overview}</div></>}
          {ops.supplier_relationships && <><div style={S.label}>Supplier Relationships</div><div style={S.value}>{ops.supplier_relationships}</div></>}

          {ops.employees && ops.employees.length > 0 && (
            <>
              <div style={S.label}>Team</div>
              <table style={S.table}>
                <thead>
                  <tr>{['Role', 'Count', 'Avg Tenure', 'Notes'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {ops.employees.map((e: Record<string, string>, i: number) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{e.role}</td>
                      <td style={S.td}>{e.count}</td>
                      <td style={S.td}>{e.tenure}</td>
                      <td style={{ ...S.td, color: '#9BA8C0' }}>{e.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Growth Opportunities */}
      {growth && growth.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Growth Opportunities</div>
          {growth.map((g: Record<string, string>, i: number) => (
            <div key={i} style={{ marginBottom: '20px', padding: '18px', background: 'rgba(46,204,139,0.05)', border: '1px solid rgba(46,204,139,0.15)', borderRadius: '12px', borderLeft: '3px solid #2ECC8B' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#F2EEE7', marginBottom: '10px' }}>{i + 1}. {g.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[['Current State', g.current_state], ['Opportunity', g.opportunity], ['Revenue Impact', g.revenue_impact], ['Timeline', g.timeline]].map(([label, val]) => val ? (
                  <div key={label}>
                    <div style={S.label}>{label}</div>
                    <div style={{ fontSize: '14px', color: '#9BA8C0', lineHeight: 1.6 }}>{val}</div>
                  </div>
                ) : null)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Market Analysis */}
      {ma && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Market Analysis</div>
          {ma.industry_overview && <><div style={S.label}>Industry Overview</div><div style={S.value}>{ma.industry_overview}</div></>}
          {ma.competitive_landscape && <><div style={S.label}>Competitive Landscape</div><div style={S.value}>{ma.competitive_landscape}</div></>}
          {ma.barriers_to_entry && ma.barriers_to_entry.length > 0 && (
            <>
              <div style={S.label}>Barriers to Entry</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ma.barriers_to_entry.map((b: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#C9A84C', flexShrink: 0 }}>◆</div>
                    <div style={{ fontSize: '14px', color: '#9BA8C0' }}>{b}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Deal Structure */}
      {ds && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Deal Structure & Transaction Overview</div>
          {ds.transaction_overview && <><div style={S.label}>Transaction Overview</div><div style={S.value}>{ds.transaction_overview}</div></>}
          {ds.preferred_structure && <><div style={S.label}>Preferred Structure</div><div style={S.value}>{ds.preferred_structure}</div></>}
          {ds.transition_plan && <><div style={S.label}>Transition Plan</div><div style={S.value}>{ds.transition_plan}</div></>}
          {ds.timing && <><div style={S.label}>Timing</div><div style={S.value}>{ds.timing}</div></>}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#3A4860', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.7 }}>
        CONFIDENTIAL — This document is prepared by Kingdom Broker Inc. and is intended solely for the use of the recipient.<br />
        Distribution or reproduction without written consent is prohibited. Kingdom Broker Inc. · Plano, Texas · KingdomBroker.com
      </div>
    </div>
  )
}
