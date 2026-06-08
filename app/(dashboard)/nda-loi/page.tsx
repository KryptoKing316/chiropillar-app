import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function NdaLoiPage() {
  return (
    <ComingSoon
      eyebrow="NDAs & LOIs · DocuSeal integration"
      title="One-click NDA. One-click LOI. Signed and dated."
      description="Every clinic in active diligence gets the full document workflow handled in-platform. ProMed VA generates the NDA + Letter of Intent + Term Sheet from the deal calculator output, routes them through DocuSeal for legally binding e-signature, and timestamps each step in the deal audit trail. No more bouncing PDFs through email."
      eta="Phase 3 · 2026-Q4"
      bullets={[
        { title: 'Auto-generated NDA per clinic', desc: 'When a clinic moves into Diligence, the platform drafts a Mutual NDA pre-filled with the practice name, owner name, and Wagner Family Office terms. Click Send → seller signs in their inbox.' },
        { title: 'LOI from the deal calculator', desc: 'Calculator inputs (purchase multiple, cash + seller note + profit share + rollover) auto-populate the LOI template. Wagner reviews, click Send, seller signs.' },
        { title: 'DocuSeal e-signature', desc: 'Legally binding signatures via DocuSeal\'s OAuth integration. Time-stamped, IP-logged, audit-grade. Signed PDFs auto-filed in the per-clinic Data Room.' },
        { title: 'Counter-sign + amendment flow', desc: 'Seller can mark up the LOI inline; Wagner sees the proposed changes, accepts or counters, and the system tracks each revision.' },
        { title: 'Master Service Agreement on close', desc: 'When the deal closes, the MSA, Asset Purchase Agreement, and management-services contract all flow through the same DocuSeal pipeline. No external lawyer routing for standard deals.' },
      ]}
    />
  )
}
