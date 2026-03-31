import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight, CalendarClock } from "lucide-react";
import { BlogPost, CATEGORY_LABELS, formatDate, isScheduled } from "@/lib/blog";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const scheduled = isScheduled(post);

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-zen-surface border border-zen-border-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-zen-caribbean-green/40 hover:shadow-2xl hover:shadow-zen-caribbean-green/5"
      >
        {/* Thumbnail — 16:9, eager load (featured = above fold) */}
        {post.thumbnail ? (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={post.thumbnail}
              alt={post.thumbnailAlt ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            {/* Gradient overlay — fade hacia el card */}
            <div className="absolute inset-0  " />
          </div>
        ) : (
          /* Sin imagen: línea decorativa top */
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zen-caribbean-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        )}

        <div className="p-8">
          {/* Meta row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zen-caribbean-green/10 text-zen-caribbean-green border border-zen-caribbean-green/30 uppercase tracking-wide">
                {categoryLabel}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zen-anti-flash/60">
                <Clock className="w-3 h-3" />
                {post.readingTime} min
              </span>
              {scheduled && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  Programado
                </span>
              )}
            </div>
            <div className="w-7 h-7 rounded-full border border-zen-border-soft flex items-center justify-center opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 group-hover:border-zen-caribbean-green/40 shrink-0 ml-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-zen-caribbean-green" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-zen-anti-flash mb-3 leading-snug group-hover:text-zen-caribbean-green transition-colors duration-200">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-zen-anti-flash/60 text-sm leading-relaxed line-clamp-3 mb-7">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zen-border-soft">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 flex items-center justify-center shrink-0">
                <span className="text-zen-caribbean-green text-xs font-bold">Z</span>
              </div>
              <span className="text-xs text-zen-anti-flash/60">{post.author}</span>
            </div>
            <time className="text-xs text-zen-anti-flash/60" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  // Regular card
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-zen-surface border border-zen-border-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-zen-caribbean-green/30 hover:shadow-lg hover:shadow-zen-caribbean-green/5"
    >
      {/* Thumbnail — 16:9, lazy load */}
      {post.thumbnail && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={post.thumbnailAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zen-surface/80 to-transparent" />
        </div>
      )}

      {/* Left accent bar — solo visible si no hay imagen */}
      {!post.thumbnail && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-zen-caribbean-green origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
      )}

      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zen-caribbean-green/10 text-zen-caribbean-green">
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-zen-anti-flash/60">
            <Clock className="w-3 h-3" />
            {post.readingTime} min
          </span>
          {scheduled && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              Programado
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-zen-anti-flash mb-2.5 leading-snug line-clamp-2 group-hover:text-zen-caribbean-green transition-colors duration-200">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-zen-anti-flash/60 text-sm leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {/* Date */}
        <time className="text-xs text-zen-anti-flash/60" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
