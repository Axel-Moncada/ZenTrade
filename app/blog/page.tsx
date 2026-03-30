import type { Metadata } from "next";
import { getAllPosts, CATEGORY_LABELS } from "@/lib/blog";

// Revalida cada hora — posts programados aparecen sin redeploy
export const revalidate = 3600;
import PostCard from "@/components/blog/post-card";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog de Trading — Guías, Pruebas de Fondeo y Estrategias",
  description:
    "Artículos sobre trading de futuros, cómo pasar pruebas de fondeo de FTMO, Apex y TopStep, y cómo llevar un journal de trading efectivo para mejorar tu rendimiento.",
  keywords: [
    "blog trading futuros",
    "pruebas de fondeo",
    "empresa de fondeo",
    "como pasar FTMO",
    "journal de trading",
    "trading futuros LATAM",
  ],
  alternates: {
    canonical: "https://zen-trader.com/blog",
  },
  openGraph: {
    title: "Blog de Trading — Guías, Prop Firms y Estrategias | Zentrade",
    description:
      "Guías prácticas sobre trading de futuros, prop firms y journal de trading.",
    type: "website",
    url: "https://zen-trader.com/blog",
  },
};

export default async function BlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-zen-bg">
      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-zen-caribbean-green text-sm font-semibold uppercase tracking-widest mb-3">
            Blog
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-zen-anti-flash mb-4 leading-tight">
            Recursos para traders de futuros
          </h1>
          <p className="text-zen-text-muted text-lg leading-relaxed">
            Guías prácticas sobre trading de futuros, cómo pasar pruebas de fondeo (FTMO, Apex,
            TopStep) y cómo llevar un journal de trading que realmente mejore tu rendimiento.
          </p>
        </div>

        {/* Category pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-12">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-zen-surface border border-zen-border-soft text-zen-text-muted"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* Featured posts */}
        {featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs uppercase tracking-widest text-zen-caribbean-green font-semibold mb-6">
              Destacados
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* All posts */}
        {rest.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-zen-caribbean-green font-semibold mb-6">
              Todos los artículos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zen-text-muted">
              Próximamente — estamos preparando contenido de alto valor para traders.
            </p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
