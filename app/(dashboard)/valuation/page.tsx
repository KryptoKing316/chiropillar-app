import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function ValuationPage() {
  return (
    <ComingSoon
      eyebrow="AI Valuation Engine"
      title="158-comp valuation, productized per clinic."
      description="Upload three years of P&L + tax returns for any chiropractic practice. Claude extracts gross revenue, owner comp, ad-backs, and normalized SDE/EBITDA, then prices the practice against the live N=102 comp set across solo, multi-DC, and platform profiles."
      eta="Phase 2 · 2026-Q3"
      bullets={[
        { title: 'PDF financial extraction', desc: 'Drop in 3 years of P&L + tax returns + bank statements. Claude parses each document, normalizes the chart of accounts, and produces a clean financial summary.' },
        { title: 'Auto add-back detection', desc: 'AI flags owner comp, family payroll, personal vehicle, travel, one-time legal — the standard chiro add-back stack — with reasoning the seller can audit.' },
        { title: 'Comp-based valuation band', desc: 'Returns low/mid/high range calibrated to N=102 real practice sales. Same engine the public /intake form uses, with full per-clinic detail and 3-year normalization.' },
        { title: 'Deal-structure recommendation', desc: 'Claude suggests cash/seller-note/profit-share/rollover-equity mix based on practice size, owner role, and seller cash-flow needs — auto-fills a structured offer letter.' },
        { title: 'Comparable transactions tab', desc: 'Shows the 10 closest comps from the N=102 set with revenue, SDE, multiple, and sale year — defensible math you can hand a seller in 30 seconds.' },
      ]}
    />
  )
}
