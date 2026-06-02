import ComingSoon from '@/components/dashboard/ComingSoon'

export const dynamic = 'force-dynamic'

export default function AdminPanelPage() {
  return (
    <ComingSoon
      eyebrow="Admin Panel · admin only"
      title="Team, integrations, audit, and platform health."
      description="The control surface for the three admins (Eric, Wagner, McGrath). Manage who has access, what integrations are wired, audit who touched what, and monitor platform health — all in one place. Not visible to chiropractors or per-clinic users."
      eta="Phase 3 · 2026-Q4"
      bullets={[
        { title: 'Team & access whitelist', desc: 'Add or remove admin emails from the chiropillar_team allow-list. Promote a teammate, deactivate a stale invite, see when each person last logged in.' },
        { title: 'Integration status', desc: 'Live health of every external integration: Supabase Auth · Resend SMTP · QuickBooks · DocuSeal · Stripe · Plaid. Red/yellow/green per service.' },
        { title: 'Audit log', desc: 'Every admin action — who added a team member, who changed a deal status, who downloaded a clinic\'s P&L. Full timestamped trail for compliance.' },
        { title: 'Platform health', desc: 'API response times, error rates, magic-link delivery success, intake submission rate. Surfaces problems before users notice.' },
        { title: 'Rotate keys + tokens', desc: 'One-click rotation for Supabase service key, Resend API key, Anthropic key. Old key revoked, new key auto-deployed to Vercel.' },
      ]}
    />
  )
}
