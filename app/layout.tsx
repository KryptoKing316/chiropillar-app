import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://chiropillar.com'),
  title: 'PROMEDVA — A medical partnership for Virginia chiropractors: better outcomes, a stronger practice',
  description: 'PROMEDVA partners with select Virginia chiropractic practices — a licensed mobile medical team brings advanced diagnostics and cash-pay services into your existing clinic so you can measure outcomes and grow responsibly, without changing how you practice.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/chiropillar-icon.png',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'PROMEDVA · A medical partnership for Virginia chiropractors',
    description: 'A medical partnership for select Virginia chiropractors — a licensed mobile medical team brings advanced diagnostics and cash-pay services into your practice so you can measure outcomes and grow responsibly. See if you qualify.',
    url: 'https://chiropillar.com',
    siteName: 'PROMEDVA',
    images: [
      {
        url: '/og-chiropillar-app.svg',
        width: 1200,
        height: 630,
        alt: 'PROMEDVA · Virginia · Chiropractor Partnership Program',
      },
      // Fallback PNG for Twitter/X which doesn't render SVG OG
      {
        url: '/chiropillar-logo.png',
        width: 1200,
        height: 630,
        alt: 'PROMEDVA — Virginia',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROMEDVA · A medical partnership for Virginia chiropractors',
    description: 'A medical partnership for select Virginia chiropractors — advanced diagnostics + cash-pay services in your existing practice. Measure outcomes, grow responsibly. See if you qualify.',
    images: ['/chiropillar-logo.png'],
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
