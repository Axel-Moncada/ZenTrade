import fs from "fs";
import path from "path";

export type BlogContentType =
  | "h2"
  | "h3"
  | "p"
  | "ul"
  | "ol"
  | "callout"
  | "cta"
  | "faq"
  | "table"
  | "image"
  | "divider";

export type CalloutVariant = "tip" | "info" | "warning" | "success";

export interface FaqItem {
  q: string;
  a: string;
}

export interface BlogContentBlock {
  type: BlogContentType;
  // h2, h3, p, callout
  text?: string;
  // ul, ol — string items. For faq blocks JSON posts also use items (cast in renderer)
  items?: string[];
  // callout
  variant?: CalloutVariant;
  // cta
  href?: string;
  buttonText?: string;
  // faq — alias for items when type === "faq"
  faqItems?: FaqItem[];
  // table
  headers?: string[];
  rows?: string[][];
  // image
  src?: string;
  alt?: string;
  caption?: string;
}

/** Pares de posts ES ↔ EN para hreflang. Clave = slug ES, valor = slug EN */
export const HREFLANG_PAIRS: Record<string, string> = {
  "como-pasar-apex-trader-funding":          "how-to-pass-apex-trader-funding",
  "como-pasar-topstep-evaluacion":           "how-to-pass-topstep-evaluation",
  "como-pasar-evaluacion-ftmo-journal-trading": "how-to-pass-ftmo-evaluation",
  "consistency-rule-fondeo-explicada":       "consistency-rule-prop-firm-explained",
  "que-es-un-trading-journal":               "what-is-a-trading-journal",
  "mejor-journal-trading-futuros-2025":      "best-trading-journal-prop-firms",
  "mejores-empresas-fondeo-futuros-2025":    "best-prop-firms-futures-traders",
  "que-es-drawdown-trading":                "what-is-drawdown-trading",
  "max-daily-loss-como-respetar":           "max-daily-loss-fondeo-how-to-manage",
};

/** Índice inverso EN → ES generado automáticamente desde HREFLANG_PAIRS */
const HREFLANG_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(HREFLANG_PAIRS).map(([es, en]) => [en, es])
);

/** Devuelve el slug del post alternativo en el otro idioma, o null */
export function getHreflangAlternate(slug: string): string | null {
  return HREFLANG_PAIRS[slug] ?? HREFLANG_REVERSE[slug] ?? null;
}

/** Detecta el idioma del post: prioriza campo `lang`, luego infiere desde el autor */
export function getBlogPostLang(post: BlogPost): "es" | "en" {
  if (post.lang) return post.lang;
  return post.author === "Zentrade Team" ? "en" : "es";
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription: string;
  keywords: string[];
  author: string;
  /** LinkedIn del autor — activa Person schema en JSON-LD cuando está presente */
  authorLinkedIn?: string;
  /** Cargo del autor para el schema de persona */
  authorJobTitle?: string;
  /** Idioma explícito del post. Si se omite, se infiere desde el campo `author`. */
  lang?: "es" | "en";
  /**
   * Fecha de publicación en formato "YYYY-MM-DD".
   * Si la fecha es futura, el artículo NO aparece en producción
   * pero SÍ aparece en desarrollo (con badge "Programado").
   */
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  /**
   * Ruta relativa desde /public — ej: "/blog/journal-trading-futuros.webp"
   * Recomendado: WebP, 1200×630 para hero / 800×450 para cards (16:9)
   */
  thumbnail?: string;
  /** Alt text de la imagen. Si se omite, se usa el título del post. */
  thumbnailAlt?: string;
  content: BlogContentBlock[];
  relatedSlugs?: string[];
}

const POSTS_DIR = path.join(process.cwd(), "data", "blog", "posts");
const IS_DEV = process.env.NODE_ENV === "development";

function ensurePostsDir() {
  if (fs.existsSync(POSTS_DIR)) return;
  // En Vercel el filesystem es de solo lectura: crear la carpeta lanzaría EROFS (500).
  if (IS_DEV) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

/**
 * Un post está "publicado" si su publishedAt es hoy o anterior.
 * En desarrollo se muestran TODOS (para poder previsualizar borradores).
 */
export function isPublished(post: BlogPost): boolean {
  if (IS_DEV) return true;
  const pub = new Date(post.publishedAt + "T00:00:00");
  const today = new Date();
  today.setHours(23, 59, 59, 999); // incluye todo el día de hoy
  return pub <= today;
}

/** True si el post existe pero aún no es su fecha de publicación */
export function isScheduled(post: BlogPost): boolean {
  const pub = new Date(post.publishedAt + "T00:00:00");
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return pub > today;
}

/** Devuelve todos los posts visibles (publicados o todos en dev), ordenados por fecha desc */
export function getAllPosts(): BlogPost[] {
  ensurePostsDir();
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      return JSON.parse(raw) as BlogPost;
    })
    .filter(isPublished)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Devuelve un post por slug, o null si:
 * - No existe el archivo
 * - Su fecha de publicación es futura (en producción)
 */
export function getPostBySlug(slug: string): BlogPost | null {
  ensurePostsDir();
  const filePath = path.join(POSTS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const post = JSON.parse(raw) as BlogPost;
  if (!isPublished(post)) return null;
  return post;
}

/** Slugs de posts publicados (para generateStaticParams) */
export function getAllSlugs(): string[] {
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      return JSON.parse(raw) as BlogPost;
    })
    .filter(isPublished)
    .map((p) => p.slug);
}

/** Posts relacionados (solo publicados) */
export function getRelatedPosts(post: BlogPost): BlogPost[] {
  if (!post.relatedSlugs?.length) return [];
  return post.relatedSlugs
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => p !== null);
}

/** Formats a date string as "March 29, 2026" (en) o "29 de marzo de 2026" (es) */
export function formatDate(dateStr: string, lang: "es" | "en" = "en"): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  guias: { es: "Guías", en: "Guides" },
  comparativas: { es: "Comparativas", en: "Comparisons" },
  estrategia: { es: "Estrategia", en: "Strategy" },
  estrategias: { es: "Estrategias", en: "Strategies" },
  fondeo: { es: "Pruebas de Fondeo", en: "Prop Firm Evaluations" },
  psicologia: { es: "Psicología", en: "Psychology" },
  psicologia_trading: { es: "Psicología", en: "Psychology" },
  educacion: { es: "Educación", en: "Education" },
  journal: { es: "Journal", en: "Journal" },
  herramientas: { es: "Herramientas", en: "Tools" },
  metricas: { es: "Métricas", en: "Metrics" },
};

export function categoryLabel(category: string, lang: "es" | "en" = "en"): string {
  return CATEGORY_LABELS[category]?.[lang] ?? category;
}
