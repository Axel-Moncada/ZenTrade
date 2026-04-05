import type { MetadataRoute } from "next";

const SITE_URL = "https://zen-trader.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Motores de búsqueda tradicionales
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/"],
      },
      // ChatGPT / OpenAI
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Claude / Anthropic
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Perplexity
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Google AI (Search Generative Experience + Gemini)
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // You.com
      {
        userAgent: "YouBot",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: ["/", "/blog/"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Cohere
      {
        userAgent: "cohere-ai",
        allow: ["/", "/blog/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
      // Common Crawl (base de datos de entrenamiento de LLMs)
      {
        userAgent: "CCBot",
        allow: ["/", "/blog/"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
