import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function AgentCenterPage() {
  return (
    <ComingSoon
      eyebrow="Agent Center · admin only"
      title="The AI agent pipeline. Six finders, six closers."
      description="ChiroPillar's autonomous discovery + outreach pipeline. Twelve specialized agents run continuously: six discover seller-side chiropractor targets matching Wagner's buy-box; six enrich + score + write personalized outreach. Wagner sees a live engine room, not a black box."
      eta="Phase 3 · 2026-Q4"
      bullets={[
        { title: '6 Seller-discovery agents', desc: 'Search Agent · Scraper · Qualifier (Wagner\'s 7 metrics auto-scored) · Enrichment · Outreach writer · Exporter. Continuous discovery against the chiropractor universe.' },
        { title: '6 Buyer/operator agents', desc: 'Family-office + PE search agents matching ChiroPillar\'s buy-box. Each lead scored on fit, pitch drafted automatically, status logged.' },
        { title: 'Live status panel', desc: 'See each agent\'s queries fired, businesses found, scores assigned, emails written. Real-time progress per pipeline run.' },
        { title: 'One-click run', desc: 'Trigger Seller-only, Buyer-only, or Both. Python orchestrator fires, reports back in 5-20 minutes with full lead spreadsheets.' },
        { title: 'Run history + audit log', desc: 'Every run, every lead, every score, every email — fully auditable. Export to Excel or sync straight into the Acquisition Pipeline kanban.' },
      ]}
    />
  )
}
