import type { Metadata } from "next";
import { getAllPosts, categoryLabel, getBlogPostLang } from "@/lib/blog";

// Revalida cada hora — posts programados aparecen sin redeploy
export const revalidate = 3600;
import PostCard from "@/components/blog/post-card";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Trading Blog — Prop Firm Guides, Evaluations and Strategy",
  description:
    "Guides on futures trading, how to pass Apex, TopStep and FTMO evaluations, and how to keep a trading journal that actually improves your results.",
  keywords: [
    "futures trading blog",
    "prop firm evaluation",
    "how to pass Apex evaluation",
    "how to pass TopStep combine",
    "trading journal",
    "prop firm guides",
  ],
  alternates: {
    canonical: "https://www.zen-trader.com/blog",
  },
  openGraph: {
    title: "Trading Blog — Prop Firm Guides and Strategy | Zentrade",
    description:
      "Practical guides on futures trading, prop firms and trading journals.",
    type: "website",
    url: "https://www.zen-trader.com/blog",
  },
};

export default async function BlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allPosts = getAllPosts();
  // English-first: el índice muestra los posts en inglés; los de español van en su propia sección
  const posts = allPosts.filter((p) => getBlogPostLang(p) === "en");
  const spanishPosts = allPosts.filter((p) => getBlogPostLang(p) === "es");
  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-zen-rich-black">
      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">

        {/* ── Hero Header ── */}
        <div className="relative mb-16">
          {/* Decorative top rule */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-zen-border-soft" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zen-caribbean-green px-1">
              Zentrade Blog
            </span>
            <div className="h-px flex-1 bg-zen-border-soft" />
          </div>

          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-zen-anti-flash leading-tight mb-4">
              Resources for{" "}
              <span className="text-zen-caribbean-green">futures traders</span>
            </h1>
            <p className="text-zen-anti-flash/60 text-lg leading-relaxed">
              Practical guides on futures trading, how to pass prop firm evaluations
              (Apex, TopStep, FTMO) and how to keep a trading journal that actually
              improves your results.
            </p>
          </div>
        </div>

        {/* ── Category pills ── */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-14">
            <span className="text-xs text-zen-anti-flash/60 font-medium mr-1">Topics:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-zen-surface border border-zen-border-soft text-zen-anti-flash/60 hover:border-zen-caribbean-green/30 hover:text-zen-caribbean-green transition-colors duration-200 cursor-default"
              >
                {categoryLabel(cat, "en")}
              </span>
            ))}
          </div>
        )}

        {/* ── Featured posts ── */}
        {featured.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-1 h-5 rounded-full bg-zen-caribbean-green shrink-0" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-zen-anti-flash font-semibold">
                Featured articles
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Divider ── */}
        {featured.length > 0 && rest.length > 0 && (
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-zen-border-soft" />
          </div>
        )}

        {/* ── All posts ── */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-7">
              <span className="w-1 h-5 rounded-full bg-zen-border-soft shrink-0" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-zen-anti-flash/60 font-semibold">
                All articles
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-12 h-12 rounded-full bg-zen-surface border border-zen-border-soft flex items-center justify-center mb-5">
              <span className="text-zen-caribbean-green text-xl font-bold">Z</span>
            </div>
            <p className="text-zen-anti-flash font-semibold mb-2">Coming soon</p>
            <p className="text-zen-anti-flash/60 text-sm max-w-xs">
              We are preparing high-value content for futures traders.
            </p>
          </div>
        )}

        {/* ── Artículos en español (LATAM, idioma secundario) ── */}
        {spanishPosts.length > 0 && (
          <section className="mt-20" lang="es">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-1 h-5 rounded-full bg-zen-border-soft shrink-0" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-zen-anti-flash/60 font-semibold">
                Artículos en español
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spanishPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
