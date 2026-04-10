/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rsunvtanukainhbtnmlu.supabase.co" },
    ],
  },
  async redirects() {
    return [
      // Redirect non-www → www (canonical authority: www.zen-trader.com, coincide con Vercel)
      {
        source: "/:path*",
        has: [{ type: "host", value: "zen-trader.com" }],
        destination: "https://www.zen-trader.com/:path*",
        permanent: true,
      },
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
