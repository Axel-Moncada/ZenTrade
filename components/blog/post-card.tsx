import Link from "next/link";
import { Clock, Tag, CalendarClock } from "lucide-react";
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
        className="group block bg-zen-surface border border-zen-border-soft rounded-2xl overflow-hidden hover:border-zen-caribbean-green/40 transition-all duration-300 hover:shadow-lg hover:shadow-zen-caribbean-green/5"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zen-caribbean-green/10 text-zen-caribbean-green border border-zen-caribbean-green/20">
              {categoryLabel}
            </span>
            <span className="text-xs text-zen-text-muted flex items-center gap-1">
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

          <h2 className="text-xl font-bold text-zen-anti-flash mb-3 group-hover:text-zen-caribbean-green transition-colors leading-snug">
            {post.title}
          </h2>

          <p className="text-zen-text-muted text-sm leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zen-caribbean-green/20 flex items-center justify-center">
                <span className="text-zen-caribbean-green text-xs font-bold">Z</span>
              </div>
              <span className="text-xs text-zen-text-muted">{post.author}</span>
            </div>
            <time className="text-xs text-zen-text-muted" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-zen-surface border border-zen-border-soft rounded-xl overflow-hidden hover:border-zen-caribbean-green/40 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zen-caribbean-green/10 text-zen-caribbean-green">
            {categoryLabel}
          </span>
          <span className="text-xs text-zen-text-muted flex items-center gap-1">
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

        <h2 className="text-base font-semibold text-zen-anti-flash mb-2 group-hover:text-zen-caribbean-green transition-colors leading-snug line-clamp-2">
          {post.title}
        </h2>

        <p className="text-zen-text-muted text-sm leading-relaxed line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-4">
            <Tag className="w-3 h-3 text-zen-text-muted" />
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-zen-text-muted">
                {tag}{post.tags.indexOf(tag) < Math.min(2, post.tags.length - 1) ? "," : ""}
              </span>
            ))}
          </div>
        )}

        <time className="text-xs text-zen-text-muted" dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
