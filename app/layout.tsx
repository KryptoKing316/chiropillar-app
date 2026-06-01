import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'KingdomBroker.com — Deal Intelligence Platform',
  description: 'The Smarter Way to Buy and Sell Businesses. Financials analyzed, buyers matched, valuation built. Kingdom Broker runs 12 AI agents so your deal closes faster.',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'KingdomBroker.com — Deal Intelligence Platform',
    description: 'The Smarter Way to Buy and Sell Businesses. Financials analyzed. Buyers matched. Valuation built. 12 AI agents running so your deal closes faster.',
    url: 'https://app.kingdombroker.com',
    siteName: 'Kingdom Broker',
    images: [
      {
        url: 'https://app.kingdombroker.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kingdom Broker — AI-Native Business Acquisition Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KingdomBroker.com — Deal Intelligence Platform',
    description: 'The Smarter Way to Buy and Sell Businesses. 12 AI agents running. Buyers matched. Deals closed.',
    images: ['https://app.kingdombroker.com/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:opsz,wght@14..32,300..700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Apply saved theme BEFORE React hydrates to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('kb-theme');
                  if (saved && (saved === 'light-royal' || saved === 'light-forest' || saved === 'dark')) {
                    document.documentElement.setAttribute('data-theme', saved);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", fontFeatureSettings: '"cv01", "ss03"' }}>
        {children}
        {/* Apollo.io Website Visitor Tracker */}
        <Script id="apollo-tracker" strategy="afterInteractive">
          {`function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"69c47b6a12844f00154e8da7"})},document.head.appendChild(o)}initApollo();`}
        </Script>
      </body>
    </html>
  )
}
