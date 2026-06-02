import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function DataRoomPage() {
  return (
    <ComingSoon
      eyebrow="Per-Clinic Data Room"
      title="One secure room per clinic. Documents, financials, signatures."
      description="Each clinic in active diligence gets its own data room: tax returns, P&Ls, bank statements, lease, malpractice records, license verifications, NDAs, term sheets — all in one place, fully access-controlled."
      eta="Phase 3 · 2026-Q4"
      bullets={[
        { title: 'Document upload + AI extraction', desc: 'Seller uploads PDFs, Claude extracts structured financial data, populates the AI Valuation engine automatically. No manual transcription.' },
        { title: 'Granular access control', desc: 'Wagner sees clinical/operational. Eric sees structure/legal. McGrath sees ops/playbook. Sellers see only what we choose to share back.' },
        { title: 'Watermarked downloads', desc: 'Every document downloaded gets a per-user watermark with timestamp. Leakage is traceable to the requester.' },
        { title: 'NDA-gated entry', desc: 'Outside diligence teams (lenders, lawyers, lender accountants) sign DocuSeal NDA before any room access. Audit log captures every view.' },
        { title: 'Diligence checklist', desc: 'Standard chiropractic-acquisition diligence checklist auto-applied per room. Wagner can mark items complete; system blocks LOI until critical items clear.' },
      ]}
    />
  )
}
