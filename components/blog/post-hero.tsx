import Image from "next/image";
import { Clock, User, Calendar } from "lucide-react";
import { BlogPost, CATEGORY_LABELS, formatDate } from "@/lib/blog";

interface PostHeroProps {
  post: BlogPost;
}

const CATEGORY_ACCENT: Record<string, { glow: string; pill: string; bar: string }> = {
  guias:        { glow: "rgba(0,193,124,0.12)",  pill: "bg-zen-caribbean-green/10 border-zen-caribbean-green/30 text-zen-caribbean-green", bar: "bg-zen-caribbean-green"  },
  comparativas: { glow: "rgba(59,130,246,0.12)", pill: "bg-blue-500/10 border-blue-500/30 text-blue-400",                                 bar: "bg-blue-500"             },
  estrategias:  { glow: "rgba(139,92,246,0.12)", pill: "bg-violet-500/10 border-violet-500/30 text-violet-400",                           bar: "bg-violet-500"           },
  fondeo:       { glow: "rgba(245,158,11,0.12)", pill: "bg-amber-500/10 border-amber-500/30 text-amber-400",                              bar: "bg-amber-500"            },
  psicologia:   { glow: "rgba(236,72,153,0.12)", pill: "bg-pink-500/10 border-pink-500/30 text-pink-400",                                 bar: "bg-pink-500"             },
};

const DEFAULT_ACCENT = CATEGORY_ACCENT.guias;

export default function PostHero({ post }: PostHeroProps) {
  const accent = CATEGORY_ACCENT[post.category] ?? DEFAULT_ACCENT;
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zen-border-soft bg-zen-surface mb-10">

      {/* Ambient glow top-left */}
      <div
        className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: accent.glow }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(242,243,244,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(242,243,244,0.5) 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent.bar} opacity-60`} />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 flex flex-col gap-5" style={{ minHeight: "220px" }}>

        {/* Category + reading time */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest ${accent.pill}`}>
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-zen-anti-flash/60">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime} min de lectura
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-zen-anti-flash leading-tight max-w-3xl">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-zen-anti-flash/60 text-base leading-relaxed max-w-2xl">
          {post.excerpt}
        </p>

        {/* Author + date */}
        <div className="flex items-center gap-5 pt-2 border-t border-zen-border-soft flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 flex items-center justify-center shrink-0">
              <span className="text-zen-caribbean-green text-xs font-bold">Z</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-zen-anti-flash">
              <User className="w-3 h-3 text-zen-anti-flash/40" />
              {post.author}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-zen-anti-flash/60">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
          {post.updatedAt !== post.publishedAt && (
            <span className="text-xs text-zen-anti-flash/60">
              Actualizado:{" "}
              <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail — separada del fondo, con bordes redondeados */}
      {post.thumbnail && (
        <div className="relative w-full aspect-video overflow-hidden border-t border-zen-border-soft">
          <Image
            src={post.thumbnail}
            alt={post.thumbnailAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority          /* above the fold — carga inmediata, mejora LCP */
            fetchPriority="high"
          />
        </div>
      )}
    </div>
  );
}
