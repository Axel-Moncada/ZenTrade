import { getAllPosts } from "@/lib/blog";
import { NextResponse } from "next/server";

const INDEXNOW_KEY = "334f8cd99c5442168464de9b300f8483";
const SITE_URL = "https://zen-trader.com";

/**
 * Notifica a Bing/IndexNow con todas las URLs del blog publicadas.
 * Llamar después de cada deploy o una vez al día via cron.
 * GET /api/cron/indexnow
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = getAllPosts();
  const urls = [
    SITE_URL,
    `${SITE_URL}/blog`,
    ...posts.map((p) => `${SITE_URL}/blog/${p.slug}`),
  ];

  const body = {
    host: "zen-trader.com",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  return NextResponse.json({
    status: res.status,
    urls_submitted: urls.length,
    urls,
  });
}
