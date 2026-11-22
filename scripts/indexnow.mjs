// Avisa a IndexNow (Bing, Yandex, Seznam…; ChatGPT Search y Copilot usan el índice de Bing)
// las URLs del sitemap de producción. Correr DESPUÉS de cada deploy con contenido nuevo:
//   node scripts/indexnow.mjs            → todas las URLs del sitemap
//   node scripts/indexnow.mjs /tools /vs/tradersync   → solo esas rutas
const HOST = "www.zen-trader.com";
const KEY = "2d613df4c8ef3a57663c043917582bd0";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function sitemapUrls() {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => `https://${HOST}${p.startsWith("/") ? p : "/" + p}`) : await sitemapUrls();

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} URLs`);
