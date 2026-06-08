import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "https://kingdombroker.com",
  "https://www.kingdombroker.com",
  "https://app.kingdombroker.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer info
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for 1 year (enable once on HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Disable browser features not needed
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs inline scripts for hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      // Styles: self + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts from Google
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + Unsplash + Pexels (CIM cover, mockups) + KB domains
      "img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://images.pexels.com https://kingdombroker.com https://www.kingdombroker.com https://*.tile.opentopomap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com",
      // API calls: self + Supabase
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://upstash.io",
      // No one can embed us in a frame
      "frame-ancestors 'none'",
      // We embed Google Maps for the Charlottesville deep-dive on /analytics
      "frame-src https://www.google.com https://maps.google.com https://*.google.com",
      // No object embeds
      "object-src 'none'",
      // Base URI restricted
      "base-uri 'self'",
      // Form submissions only to self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['docusign-esign'],
  // Suppress Turbopack/webpack coexistence warning in dev
  turbopack: {},

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // CORS headers for API routes only
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Dynamic origin handled in route handlers; this covers preflight
            value: ALLOWED_ORIGINS.join(", "),
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
export { ALLOWED_ORIGINS };
