/** @type {import('next').NextConfig} */
const nextConfig = {
  // Los posts del blog se leen con fs en runtime (ISR / posts programados): incluirlos en el bundle
  outputFileTracingIncludes: {
    "/blog": ["./data/blog/posts/**/*"],
    "/blog/[slug]": ["./data/blog/posts/**/*"],
    "/blog/og/[slug]": ["./data/blog/posts/**/*"],
    "/sitemap.xml": ["./data/blog/posts/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rsunvtanukainhbtnmlu.supabase.co" },
    ],
  },
  async redirects() {
    return [
      // Redirect non-www → www (canonical authority: www.zen-trader.com)
      {
        source: "/:path*",
        has: [{ type: "host", value: "zen-trader.com" }],
        destination: "https://www.zen-trader.com/:path*",
        permanent: true,
      },
      // Old slug → canonical slug (evita contenido duplicado en Google)
      {
        source: "/blog/zentrade-vs-tradezella",
        destination: "/vs/tradezella",
        permanent: true,
      },
      // Slugs con año → slugs estables (2026-11-22, GEO: contenido fresco sin romper enlaces)
      // Comparativas del blog consolidadas en /vs/* (evita canibalización)
      { source: "/blog/zentrade-vs-tradezella-comparison", destination: "/vs/tradezella", permanent: true },
      { source: "/blog/zentrade-vs-edgewonk-comparison", destination: "/vs/edgewonk", permanent: true },
      { source: "/blog/best-trading-journal-prop-firms-2025", destination: "/blog/best-trading-journal-prop-firms", permanent: true },
      { source: "/blog/best-futures-trading-journal-2025", destination: "/blog/best-futures-trading-journal", permanent: true },
      { source: "/blog/best-prop-firms-futures-traders-2025", destination: "/blog/best-prop-firms-futures-traders", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
