// ChiroPillar root: bounce to /intake (public chiropractor form).
// Team members logged in already get bounced to /calculator from
// the dashboard layout. Keeping this simple — the marketing surface
// is the intake form itself, not a landing page.

import { redirect } from 'next/navigation'

export default function Root() {
  redirect('/intake')
}
