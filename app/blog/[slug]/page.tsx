import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  CATEGORY_LABELS,
} from "@/lib/blog";
import PostContent from "@/components/blog/post-content";
import PostHero from "@/components/blog/post-hero";
import PostCard from "@/components/blog/post-card";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";

// Revalida cada hora — artículos programados aparecen sin redeploy
export const revalidate = 3600;

const SITE_URL = "https://www.zen-trader.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription;
  const canonical = `${SITE_URL}/blog/${slug}`;
  const ogImage = `${SITE_URL}/blog/og/${slug}`;

  return {
    title,
    description,
    keywords: post.keywords.join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

function buildJsonLd(post: ReturnType<typeof getPostBySlug>) {
  if (!post) return null;

  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const hasFaq = post.content.some((b) => b.type === "faq");
  const ogImageUrl = `${SITE_URL}/blog/og/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    image: {
      "@type": "ImageObject",
      url: ogImageUrl,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Zentrade",
      url: SITE_URL,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: canonical,
    keywords: post.keywords.join(", "),
    inLanguage: "es-ES",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const schemas: object[] = [articleSchema, breadcrumbSchema];

  // FAQPage schema — cuando el post tiene un bloque faq
  if (hasFaq) {
    const faqBlock = post.content.find((b) => b.type === "faq");
    const faqEntries = faqBlock?.faqItems ?? (faqBlock?.items as unknown as { q: string; a: string }[] | undefined);
    if (faqEntries?.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      });
    }
  }

  // HowTo schema — auto-generado desde h3 que empiecen con "Paso" o "Step"
  // Permite a LLMs citar instrucciones como pasos estructurados
  const howToSteps = post.content
    .map((block, idx) => ({ block, idx }))
    .filter(({ block }) => block.type === "h3" && /^(paso|step)\s+\d/i.test(block.text ?? ""))
    .map(({ block, idx }, position) => {
      // Buscar el párrafo inmediato siguiente al h3 para usar como descripción del paso
      const nextP = post.content.slice(idx + 1).find((b) => b.type === "p");
      const description = nextP?.text?.replace(/<[^>]+>/g, "") ?? block.text ?? "";
      return {
        "@type": "HowToStep",
        position: position + 1,
        name: block.text,
        text: description.slice(0, 300),
      };
    });

  if (howToSteps.length >= 2) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: post.title,
      description: post.seoDescription,
      inLanguage: post.slug.startsWith("how-to") || post.slug.startsWith("what-is") || post.slug.startsWith("best-") || post.slug.startsWith("consistency-rule-prop") ? "en" : "es",
      step: howToSteps,
    });
  }

  return schemas;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const related = getRelatedPosts(post);
  const schemas = buildJsonLd(post);

  return (
    <div className="min-h-screen bg-zen-rich-black">
      {schemas && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}

      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-5xl mx-auto">

          {/* ── Breadcrumb ── */}
          <nav
            className="flex items-center gap-1.5 text-xs text-zen-anti-flash/60 mb-8"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-zen-caribbean-green transition-colors duration-200">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 text-zen-anti-flash/30" />
            <Link href="/blog" className="hover:text-zen-caribbean-green transition-colors duration-200">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-zen-anti-flash/30" />
            <span className="text-zen-anti-flash/80 truncate max-w-[220px]">{post.title}</span>
          </nav>

          {/* ── Hero banner — categoría, título, author, fecha ── */}
          <PostHero post={post} />

          {/* ── Article body ── */}
          <article
            itemScope
            itemType="https://schema.org/Article"
            itemProp="articleBody"
          >
            <PostContent blocks={post.content} />
          </article>

          {/* ── Tags ── */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-10 pt-8 border-t border-zen-border-soft">
              <span className="text-xs text-zen-anti-flash/60 font-medium">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-zen-surface border border-zen-border-soft text-zen-anti-flash/60 hover:border-zen-caribbean-green/30 hover:text-zen-caribbean-green transition-colors duration-200 cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Related posts ── */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16 pt-12 border-t border-zen-border-soft">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-1 h-5 rounded-full bg-zen-caribbean-green shrink-0" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-zen-anti-flash font-semibold">
                Artículos relacionados
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((rel) => (
                <PostCard key={rel.slug} post={rel} />
              ))}
            </div>
          </section>
        )}

        {/* ── Back to blog ── */}
        <div className="max-w-3xl mx-auto mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zen-anti-flash/60 hover:text-zen-caribbean-green transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Volver al blog
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
