import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function ScaleServicesPage() {
  return (
    <ComingSoon
      eyebrow="Scale Services"
      title="Dr. Wagner's consulting catalog. Productized."
      description="Standalone packages chiropractors can purchase without joining the roll-up partnership. Wagner monetizes the playbook directly: consulting calls, group masterminds, full operating-system installs, and the medical-team add-on as a service."
      eta="Phase 3 · 2026-Q4"
      bullets={[
        { title: 'Stripe checkout per package', desc: 'Single one-click purchase. Receipts auto-generated. Wagner sees revenue per package + per buyer in the Scale Services dashboard.' },
        { title: 'Strategy Call ($500–2,500)', desc: '60-min 1:1 with Wagner covering practice diagnostics, growth bottlenecks, medical-team feasibility. Calendly auto-booking, recorded for the buyer.' },
        { title: 'Practice Audit ($5,000–10,000)', desc: 'Multi-day diagnostic: P&L review, KPI assessment, medical-team feasibility, growth plan. Deliverable: written report + 90-day action plan.' },
        { title: 'Medical-Team Installation ($25,000–50,000)', desc: 'Wagner team installs the medical-operator playbook in the buyer\'s practice — credentialing, billing, hiring, compliance — over 90 days.' },
        { title: 'ChiroPillar Mastermind ($12,000/yr)', desc: 'Quarterly in-person + monthly group calls. 20-30 chiropractors who want to scale without selling. Wagner + curated guest operators.' },
      ]}
    />
  )
}
