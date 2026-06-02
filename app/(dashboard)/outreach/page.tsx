import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function OutreachPage() {
  return (
    <ComingSoon
      eyebrow="Outreach Campaigns"
      title="Drip on every applicant. Never lose a maybe."
      description="Multi-channel outreach automation built around the chiropillar_targets table. Every intake submission triggers a personalized sequence — qualified, maybe, and not-yet leads each get their own track."
      eta="Phase 2 · 2026-Q3"
      bullets={[
        { title: 'Email drip via Resend', desc: 'Day 0 thank-you with valuation band → Day 3 case study → Day 7 calendar link → Day 14 Wagner personal note. Each step is editable.' },
        { title: 'SMS via Twilio', desc: 'Optional opt-in SMS reminder 24 hours before a scheduled call. Reduces no-shows from chiros who forget after submitting.' },
        { title: 'Auto-dial integration', desc: 'Qualified intakes get added to an Instantly / Aircall dialer queue. McGrath\'s team gets a list with valuation context already attached.' },
        { title: 'A/B test framework', desc: 'Try two pitch angles — financial vs. "be a better doctor" — and let conversion data decide which gets promoted. Built-in significance check.' },
        { title: 'Re-engagement for "not yet"', desc: 'Chiros who didn\'t qualify get a 90-day nurture: $1/day marketing playbook, growth tips, then re-application invite once they hit the 40+ new-patients threshold.' },
      ]}
    />
  )
}
