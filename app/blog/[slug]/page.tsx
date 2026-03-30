import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, Calendar, User } from "lucide-react";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  formatDate,
  CATEGORY_LABELS,
} from "@/lib/blog";

// Revalida cada hora — artículos programados aparecen sin redeploy
export const revalidate = 3600;
import PostContent from "@/components/blog/post-content";
import PostCard from "@/components/blog/post-card";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://zen-trader.com";

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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonical,
      },
    ],
  };

  const schemas: object[] = [articleSchema, breadcrumbSchema];

  if (hasFaq) {
    const faqBlock = post.content.find((b) => b.type === "faq");
    if (faqBlock?.faqItems?.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqBlock.faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      });
    }
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
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;

  return (
    <div className="min-h-screen bg-zen-bg">
      {/* JSON-LD structured data */}
      {schemas && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
      )}

      <PublicNavbar isAuthenticated={!!user} />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1 text-xs text-zen-text-muted mb-8"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-zen-caribbean-green transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-zen-caribbean-green transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zen-anti-flash truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Article header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zen-caribbean-green/10 text-zen-caribbean-green border border-zen-caribbean-green/20">
                {categoryLabel}
              </span>
              <span className="text-xs text-zen-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min de lectura
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-zen-anti-flash leading-tight mb-5">
              {post.title}
            </h1>

            <p className="text-zen-text-muted text-lg leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex items-center gap-5 border-t border-zen-border-soft pt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zen-caribbean-green/20 flex items-center justify-center">
                  <span className="text-zen-caribbean-green text-sm font-bold">Z</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-zen-anti-flash flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-zen-text-muted">
                <Calendar className="w-3 h-3" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
              {post.updatedAt !== post.publishedAt && (
                <p className="text-xs text-zen-text-muted">
                  Actualizado: <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                </p>
              )}
            </div>
          </header>

          {/* Article body */}
          <article
            itemScope
            itemType="https://schema.org/Article"
            itemProp="articleBody"
          >
            <PostContent blocks={post.content} />
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-10 pt-8 border-t border-zen-border-soft">
              <span className="text-xs text-zen-text-muted font-medium">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-zen-surface border border-zen-border-soft text-zen-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16">
            <h2 className="text-xs uppercase tracking-widest text-zen-caribbean-green font-semibold mb-6">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((rel) => (
                <PostCard key={rel.slug} post={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="max-w-3xl mx-auto mt-12">
          <Link
            href="/blog"
            className="text-sm text-zen-text-muted hover:text-zen-caribbean-green transition-colors flex items-center gap-1"
          >
            ← Volver al blog
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
