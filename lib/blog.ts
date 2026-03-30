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
  // ul, ol
  items?: string[];
  // callout
  variant?: CalloutVariant;
  // cta
  href?: string;
  buttonText?: string;
  // faq
  faqItems?: FaqItem[];
  // table
  headers?: string[];
  rows?: string[][];
  // image
  src?: string;
  alt?: string;
  caption?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription: string;
  keywords: string[];
  author: string;
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
  thumbnail?: string;
  content: BlogContentBlock[];
  relatedSlugs?: string[];
}

const POSTS_DIR = path.join(process.cwd(), "data", "blog", "posts");
const IS_DEV = process.env.NODE_ENV === "development";

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
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

/** Formats a date string as "29 de marzo de 2026" */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  guias: "Guías",
  comparativas: "Comparativas",
  estrategias: "Estrategias",
  fondeo: "Pruebas de Fondeo",
  psicologia: "Psicología",
};
