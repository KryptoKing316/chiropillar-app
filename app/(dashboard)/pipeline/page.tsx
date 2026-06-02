import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function PipelinePage() {
  return (
    <ComingSoon
      eyebrow="Acquisition Pipeline"
      title="Every chiropractor, every stage, on one board."
      description="Kanban + timeline view of the chiropractic roll-up pipeline. Each card is a clinic moving through New → Called → Scheduled → Diligence → LOI → Closed. Drag between columns to update status."
      eta="Phase 2 · 2026-Q3"
      bullets={[
        { title: 'Kanban pipeline board', desc: 'Six columns matching the chiropillar_targets.outreach_status enum. Drag a clinic forward — the DB updates and the activity log captures who moved it.' },
        { title: 'Per-clinic timeline', desc: 'Click any clinic to see the full history: intake submission → first call → financials received → term sheet sent → signature → close. Audit trail for Wagner.' },
        { title: 'Weighted-EBITDA forecast', desc: 'Each stage has a probability weight (10% New, 25% Called, 50% LOI, 80% signed) — the platform shows weighted projected EBITDA closing this quarter.' },
        { title: 'Assignment + handoff', desc: 'Wagner runs clinical diligence, McGrath runs ops, Eric runs structure. Each clinic gets an assigned owner; handoff notifications fire on stage transitions.' },
        { title: 'Slack / SMS alerts', desc: 'New qualified intake → Wagner + Eric notified. Clinic enters LOI → all three get an alert. Configurable per stage.' },
      ]}
    />
  )
}
