import { ImageResponse } from "next/og";
import { getPostBySlug, CATEGORY_LABELS } from "@/lib/blog";

export const dynamic = "force-static";
export const revalidate = false; // Cache indefinido — solo cambia si el post cambia

const ZEN_GREEN = "#00c17c";
const ZEN_BG = "#070d07";
const ZEN_TEXT = "#f0f4f0";
const ZEN_MUTED = "#6b8f7a";
const ZEN_DIM = "#3a5a47";

const CATEGORY_COLORS: Record<string, string> = {
  guias: "#00c17c",
  comparativas: "#3b82f6",
  estrategias: "#8b5cf6",
  fondeo: "#f59e0b",
  psicologia: "#ec4899",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const accentColor = CATEGORY_COLORS[post.category] ?? ZEN_GREEN;

  // Carga Inter Bold desde Google Fonts (cacheado por la CDN de Vercel)
  let fontData: ArrayBuffer;
  try {
    fontData = await fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
    ).then((r) => r.arrayBuffer());
  } catch {
    // Si falla la carga de fuente, continúa sin fuente personalizada
    fontData = new ArrayBuffer(0);
  }

  // Trunca el título si es muy largo para que quepa bien
  const titleFontSize = post.title.length > 70 ? 44 : post.title.length > 50 ? 50 : 56;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: ZEN_BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 64px",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo — grid pattern sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,193,124,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,193,124,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow radial desde arriba-izquierda */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
        }}
      />

      {/* Contenido principal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Pill de categoría */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              background: `${accentColor}20`,
              border: `1.5px solid ${accentColor}50`,
              borderRadius: "100px",
              padding: "6px 18px",
              color: accentColor,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Título del artículo */}
        <div
          style={{
            fontSize: `${titleFontSize}px`,
            fontWeight: 700,
            color: ZEN_TEXT,
            lineHeight: 1.25,
            maxWidth: "980px",
          }}
        >
          {post.title}
        </div>
      </div>

      {/* Barra inferior */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Meta — lectura + autor + URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: ZEN_MUTED,
              fontSize: "16px",
            }}
          >
            <span>{post.readingTime} min de lectura</span>
            <span style={{ color: ZEN_DIM }}>·</span>
            <span>{post.author}</span>
          </div>
          <div style={{ color: ZEN_DIM, fontSize: "14px" }}>
            zen-trader.com/blog/{post.slug}
          </div>
        </div>

        {/* Logotipo Zentrade */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `${ZEN_GREEN}20`,
              border: `1.5px solid ${ZEN_GREEN}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: ZEN_GREEN,
            }}
          >
            Z
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: ZEN_TEXT,
              letterSpacing: "-0.02em",
            }}
          >
            Zentrade
          </div>
        </div>
      </div>

      {/* Barra inferior de color */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}40 60%, transparent 100%)`,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts:
        fontData.byteLength > 0
          ? [{ name: "Inter", data: fontData, weight: 700, style: "normal" }]
          : [],
    }
  );
}
