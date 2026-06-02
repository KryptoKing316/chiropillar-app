import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function OverviewPage() {
  return (
    <ComingSoon
      eyebrow="Platform Overview"
      title="The ChiroPillar command center."
      description="A single screen showing every number that matters: applicants this week, qualified pipeline, weighted EBITDA in motion, conversion funnel from intake → LOI → close, and the current platform-EBITDA tracker against the $20M+ target."
      eta="Phase 2 · 2026-Q3"
      bullets={[
        { title: 'Live KPI strip', desc: 'Total intakes · qualified count · pipeline value · weighted EBITDA · time-to-close average — refreshed every hour from Supabase.' },
        { title: 'Conversion funnel', desc: 'Intake → Qualified → Called → LOI → Closed — visualized as a funnel with stage-by-stage drop-off and root-cause notes.' },
        { title: 'Geographic heatmap', desc: 'US map of incoming applications by state. Density highlights regions ready for cluster acquisition (Texas, Arizona, Carolinas first).' },
        { title: 'Recent activity feed', desc: 'Last 20 events across the platform: new applications, status changes, calls logged, term sheets sent — sortable + filterable.' },
        { title: 'Wagner platform-EBITDA tracker', desc: 'Vertical thermometer: $25M Wagner base + $X+ acquired ChiroPillar EBITDA = $X/45M target. Updates as deals close.' },
      ]}
    />
  )
}
