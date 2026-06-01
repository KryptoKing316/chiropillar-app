import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Earn $2,000 + 20% Commission Per Referral | Kingdom Broker Ambassador Program',
  description: 'Refer business owners thinking about selling to Kingdom Broker. Earn $2,000 cash once they become a client, plus a 20% commission when the deal closes. On a $5M deal, that is $42,000 in your pocket. CPAs, attorneys, and wealth advisors welcome.',
  openGraph: {
    title: 'Earn $2,000 + 20% Commission Per Referral',
    description: 'Refer business owners to Kingdom Broker. $2,000 on signing plus a 20% commission at close. On a $5M deal, that is $42,000 to you.',
    images: ['/og-ambassador.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earn $2,000 + 20% Commission Per Referral',
    description: 'Refer business owners to Kingdom Broker. $2,000 on signing plus a 20% commission at close. On a $5M deal, that is $42,000 to you.',
    images: ['/og-ambassador.png'],
  },
}

export default function AmbassadorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
