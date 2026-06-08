// ProMed VA · Virginia Map
// Full-screen command-center console (terrain + leaderboard + city rail) followed by
// the call-ready, per-city leads tabs. Data: ./vaChiros.ts (verify before outreach).
import VirginiaOpsConsole from './VirginiaOpsConsole'
import CallReadyLeads from './CallReadyLeads'

export const dynamic = 'force-dynamic'

export default function VirginiaMapPage() {
  return (
    <>
      <VirginiaOpsConsole />
      <CallReadyLeads />
    </>
  )
}
