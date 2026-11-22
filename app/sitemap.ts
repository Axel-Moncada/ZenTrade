import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://www.zen-trader.com";

// Revalidar a diario para que entren los posts programados sin redeploy
export const revalidate = 86400;

/**
 * Fechas reales de última modificación de cada página estática.
 * Actualízalas cuando cambie el contenido (no usar new Date(): Google deja de confiar en lastmod).
 */
const STATIC_PAGES: Array<{ path: string; lastModified: string }> = [
  { path: "", lastModified: "2026-11-22" },
  { path: "/pricing", lastModified: "2026-11-22" },
  { path: "/about", lastModified: "2026-11-22" },
  { path: "/vs/tradezella", lastModified: "2026-11-22" },
  { path: "/vs/edgewonk", lastModified: "2026-11-22" },
  { path: "/vs/tradersync", lastModified: "2026-11-22" },
  { path: "/vs/tradervue", lastModified: "2026-11-22" },
  { path: "/tools", lastModified: "2026-11-22" },
  { path: "/tools/consistency-rule-calculator", lastModified: "2026-11-22" },
  { path: "/tools/trailing-drawdown-calculator", lastModified: "2026-11-22" },
  { path: "/trading-journal-template", lastModified: "2026-11-22" },
  { path: "/es/vs/tradezella", lastModified: "2026-11-22" },
  { path: "/es/vs/edgewonk", lastModified: "2026-11-22" },
  { path: "/ftmo", lastModified: "2026-05-28" },
  { path: "/apex-trader-funding", lastModified: "2026-05-28" },
  { path: "/topstep", lastModified: "2026-05-28" },
  { path: "/es/ftmo", lastModified: "2026-05-28" },
  { path: "/es/apex-trader-funding", lastModified: "2026-05-28" },
  { path: "/es/topstep", lastModified: "2026-05-28" },
  // /login y /register son noindex — se excluyen del sitemap
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  const latestPost = posts.reduce<string>(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    "2026-01-01"
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(page.lastModified),
  }));

  return [
    ...staticEntries,
    { url: `${SITE_URL}/blog`, lastModified: new Date(latestPost) },
    ...blogEntries,
  ];
}
