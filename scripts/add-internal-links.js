// scripts/add-internal-links.js
// 1. Adds relatedSlugs to each post JSON (powers the visual "Artículos relacionados" cards)
// 2. Injects a "También te puede interesar" ul block in the article body before the CTA

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "..", "data", "blog", "posts");

// Map of slug → related slugs (max 4, ordered by relevance)
const related = {
  // ─── FTMO cluster ───────────────────────────────────────────────
  "como-pasar-evaluacion-ftmo-journal-trading": [
    "regla-consistencia-ftmo-explicada",
    "max-daily-loss-como-respetar",
    "pasos-evaluacion-ftmo",
    "reglas-riesgo-ftmo-futuros-drawdown-consistency",
  ],
  "how-to-pass-ftmo-evaluation": [
    "consistency-rule-prop-firm-explained",
    "max-daily-loss-fondeo-how-to-manage",
    "how-to-pass-apex-trader-funding",
    "best-prop-firms-futures-traders-2025",
  ],
  "pasos-evaluacion-ftmo": [
    "como-pasar-evaluacion-ftmo-journal-trading",
    "regla-consistencia-ftmo-explicada",
    "ftmo-payout-reparto-ganancias",
    "errores-comunes-evaluaciones-fondeo",
  ],
  "regla-consistencia-ftmo-explicada": [
    "como-pasar-evaluacion-ftmo-journal-trading",
    "consistency-rule-fondeo-explicada",
    "max-daily-loss-como-respetar",
    "reglas-riesgo-ftmo-futuros-drawdown-consistency",
  ],
  "reglas-riesgo-ftmo-futuros-drawdown-consistency": [
    "regla-consistencia-ftmo-explicada",
    "max-daily-loss-como-respetar",
    "drawdown-trailing-vs-estatico-prop-firms",
    "como-pasar-evaluacion-ftmo-journal-trading",
  ],
  "ftmo-payout-reparto-ganancias": [
    "como-pasar-evaluacion-ftmo-journal-trading",
    "pasos-evaluacion-ftmo",
    "mejores-empresas-fondeo-futuros-2025",
  ],
  "ftmo-swing-account-vs-regular-cuando-elegir": [
    "como-pasar-evaluacion-ftmo-journal-trading",
    "pasos-evaluacion-ftmo",
    "drawdown-trailing-vs-estatico-prop-firms",
  ],

  // ─── Apex cluster ────────────────────────────────────────────────
  "como-pasar-apex-trader-funding": [
    "apex-trader-funding-trailing-drawdown-guia",
    "drawdown-trailing-vs-estatico-prop-firms",
    "como-pasar-evaluacion-ftmo-journal-trading",
    "mejores-empresas-fondeo-futuros-2025",
  ],
  "how-to-pass-apex-trader-funding": [
    "apex-trader-funding-trailing-drawdown-guia",
    "what-is-drawdown-trading",
    "how-to-pass-ftmo-evaluation",
    "best-prop-firms-futures-traders-2025",
  ],
  "apex-trader-funding-trailing-drawdown-guia": [
    "como-pasar-apex-trader-funding",
    "drawdown-trailing-vs-estatico-prop-firms",
    "que-es-drawdown-trading",
    "reglas-riesgo-diario-fondeo",
  ],

  // ─── TopStep cluster ─────────────────────────────────────────────
  "como-pasar-topstep-evaluacion": [
    "drawdown-trailing-vs-estatico-prop-firms",
    "max-daily-loss-como-respetar",
    "como-pasar-evaluacion-ftmo-journal-trading",
    "mejores-empresas-fondeo-futuros-2025",
  ],
  "how-to-pass-topstep-evaluation": [
    "max-daily-loss-fondeo-how-to-manage",
    "what-is-drawdown-trading",
    "how-to-pass-apex-trader-funding",
    "best-prop-firms-futures-traders-2025",
  ],

  // ─── Uprofit ─────────────────────────────────────────────────────
  "como-pasar-uprofit-evaluacion": [
    "uprofit-colombia-empresa-fondeo",
    "mejores-empresas-fondeo-futuros-2025",
    "como-pasar-evaluacion-ftmo-journal-trading",
    "errores-comunes-evaluaciones-fondeo",
  ],
  "uprofit-colombia-empresa-fondeo": [
    "como-pasar-uprofit-evaluacion",
    "mejores-empresas-fondeo-futuros-2025",
    "que-es-una-empresa-de-fondeo",
  ],

  // ─── Drawdown cluster ────────────────────────────────────────────
  "que-es-drawdown-trading": [
    "drawdown-trailing-vs-estatico-prop-firms",
    "max-daily-loss-como-respetar",
    "apex-trader-funding-trailing-drawdown-guia",
    "what-is-drawdown-trading",
  ],
  "what-is-drawdown-trading": [
    "drawdown-trailing-vs-estatico-prop-firms",
    "max-daily-loss-fondeo-how-to-manage",
    "apex-trader-funding-trailing-drawdown-guia",
    "que-es-drawdown-trading",
  ],
  "drawdown-trailing-vs-estatico-prop-firms": [
    "apex-trader-funding-trailing-drawdown-guia",
    "que-es-drawdown-trading",
    "max-daily-loss-como-respetar",
    "como-pasar-apex-trader-funding",
  ],
  "max-daily-loss-como-respetar": [
    "que-es-drawdown-trading",
    "reglas-riesgo-diario-fondeo",
    "regla-consistencia-ftmo-explicada",
    "errores-comunes-evaluaciones-fondeo",
  ],
  "max-daily-loss-fondeo-how-to-manage": [
    "what-is-drawdown-trading",
    "how-to-pass-ftmo-evaluation",
    "how-to-pass-apex-trader-funding",
    "best-prop-firms-futures-traders-2025",
  ],
  "reglas-riesgo-diario-fondeo": [
    "max-daily-loss-como-respetar",
    "reglas-riesgo-ftmo-futuros-drawdown-consistency",
    "regla-consistencia-ftmo-explicada",
    "errores-comunes-evaluaciones-fondeo",
  ],

  // ─── Consistency cluster ─────────────────────────────────────────
  "consistency-rule-fondeo-explicada": [
    "regla-consistencia-ftmo-explicada",
    "como-pasar-evaluacion-ftmo-journal-trading",
    "errores-comunes-evaluaciones-fondeo",
    "consistency-rule-prop-firm-explained",
  ],
  "consistency-rule-prop-firm-explained": [
    "how-to-pass-ftmo-evaluation",
    "consistency-rule-fondeo-explicada",
    "max-daily-loss-fondeo-how-to-manage",
  ],

  // ─── Journal cluster ─────────────────────────────────────────────
  "que-es-un-trading-journal": [
    "mejor-journal-trading-futuros-2025",
    "como-llevar-journal-trading-futuros",
    "zentrade-vs-tradezella",
    "what-is-a-trading-journal",
  ],
  "what-is-a-trading-journal": [
    "best-trading-journal-prop-firms-2025",
    "how-to-track-emotions-trading",
    "zentrade-vs-tradezella-comparison",
    "que-es-un-trading-journal",
  ],
  "mejor-journal-trading-futuros-2025": [
    "que-es-un-trading-journal",
    "zentrade-vs-tradezella",
    "zentrade-vs-edgewonk",
    "como-llevar-journal-trading-futuros",
  ],
  "best-trading-journal-prop-firms-2025": [
    "what-is-a-trading-journal",
    "zentrade-vs-tradezella-comparison",
    "zentrade-vs-edgewonk-comparison",
    "how-to-track-emotions-trading",
  ],
  "como-llevar-journal-trading-futuros": [
    "que-es-un-trading-journal",
    "mejor-journal-trading-futuros-2025",
    "ninjatrader-journal-trading-futuros",
    "psicologia-trading-futuros",
  ],

  // ─── Comparisons cluster ─────────────────────────────────────────
  "zentrade-vs-tradezella": [
    "mejor-journal-trading-futuros-2025",
    "zentrade-vs-edgewonk",
    "que-es-un-trading-journal",
    "mejores-empresas-fondeo-futuros-2025",
  ],
  "zentrade-vs-tradezella-comparison": [
    "best-trading-journal-prop-firms-2025",
    "zentrade-vs-edgewonk-comparison",
    "what-is-a-trading-journal",
    "best-prop-firms-futures-traders-2025",
  ],
  "zentrade-vs-edgewonk": [
    "mejor-journal-trading-futuros-2025",
    "zentrade-vs-tradezella",
    "que-es-un-trading-journal",
    "mejores-empresas-fondeo-futuros-2025",
  ],
  "zentrade-vs-edgewonk-comparison": [
    "best-trading-journal-prop-firms-2025",
    "zentrade-vs-tradezella-comparison",
    "what-is-a-trading-journal",
    "best-prop-firms-futures-traders-2025",
  ],

  // ─── Prop firms overview ─────────────────────────────────────────
  "que-es-una-empresa-de-fondeo": [
    "mejores-empresas-fondeo-futuros-2025",
    "como-pasar-evaluacion-ftmo-journal-trading",
    "como-pasar-apex-trader-funding",
    "que-es-un-trading-journal",
  ],
  "mejores-empresas-fondeo-futuros-2025": [
    "como-pasar-evaluacion-ftmo-journal-trading",
    "como-pasar-apex-trader-funding",
    "como-pasar-topstep-evaluacion",
    "mejor-journal-trading-futuros-2025",
  ],
  "best-prop-firms-futures-traders-2025": [
    "how-to-pass-ftmo-evaluation",
    "how-to-pass-apex-trader-funding",
    "how-to-pass-topstep-evaluation",
    "best-trading-journal-prop-firms-2025",
  ],
  "errores-comunes-evaluaciones-fondeo": [
    "que-es-revenge-trading",
    "reglas-riesgo-diario-fondeo",
    "consistency-rule-fondeo-explicada",
    "psicologia-trading-futuros",
  ],

  // ─── Psychology / emotions cluster ───────────────────────────────
  "que-es-revenge-trading": [
    "psicologia-trading-futuros",
    "errores-comunes-evaluaciones-fondeo",
    "como-llevar-journal-trading-futuros",
    "how-to-track-emotions-trading",
  ],
  "psicologia-trading-futuros": [
    "que-es-revenge-trading",
    "errores-comunes-evaluaciones-fondeo",
    "como-llevar-journal-trading-futuros",
    "trading-psychology-futures-traders",
  ],
  "trading-psychology-futures-traders": [
    "how-to-track-emotions-trading",
    "profit-factor-trading-explained",
    "best-trading-journal-prop-firms-2025",
    "psicologia-trading-futuros",
  ],
  "how-to-track-emotions-trading": [
    "trading-psychology-futures-traders",
    "what-is-a-trading-journal",
    "best-trading-journal-prop-firms-2025",
    "profit-factor-trading-explained",
  ],

  // ─── Profit factor ───────────────────────────────────────────────
  "profit-factor-trading-que-es": [
    "que-es-drawdown-trading",
    "consistency-rule-fondeo-explicada",
    "mejor-journal-trading-futuros-2025",
    "profit-factor-trading-explained",
  ],
  "profit-factor-trading-explained": [
    "what-is-drawdown-trading",
    "consistency-rule-prop-firm-explained",
    "best-trading-journal-prop-firms-2025",
    "profit-factor-trading-que-es",
  ],

  // ─── Instruments & platforms ─────────────────────────────────────
  "mejores-instrumentos-futuros-principiantes": [
    "como-operar-nq-maximos-historicos-volatilidad",
    "mejores-empresas-fondeo-futuros-2025",
    "que-es-una-empresa-de-fondeo",
  ],
  "como-operar-nq-maximos-historicos-volatilidad": [
    "mejores-instrumentos-futuros-principiantes",
    "apex-trader-funding-trailing-drawdown-guia",
    "psicologia-trading-futuros",
  ],
  "como-operar-tradovate-prop-firm": [
    "como-pasar-apex-trader-funding",
    "mejor-journal-trading-futuros-2025",
    "como-llevar-journal-trading-futuros",
  ],
  "ninjatrader-journal-trading-futuros": [
    "como-llevar-journal-trading-futuros",
    "mejor-journal-trading-futuros-2025",
    "mejores-instrumentos-futuros-principiantes",
  ],
};

// Post titles for display in the ul blocks
const titles = {
  "como-pasar-evaluacion-ftmo-journal-trading": "Cómo pasar la evaluación de FTMO con un journal de trading",
  "how-to-pass-ftmo-evaluation": "How to pass the FTMO evaluation",
  "pasos-evaluacion-ftmo": "Los pasos de la evaluación de FTMO explicados",
  "regla-consistencia-ftmo-explicada": "La consistency rule de FTMO explicada",
  "reglas-riesgo-ftmo-futuros-drawdown-consistency": "Reglas de riesgo de FTMO: drawdown y consistency",
  "ftmo-payout-reparto-ganancias": "FTMO payout: cómo funciona el reparto de ganancias",
  "ftmo-swing-account-vs-regular-cuando-elegir": "FTMO Swing Account vs Regular: cuándo elegir cada una",
  "como-pasar-apex-trader-funding": "Cómo pasar Apex Trader Funding",
  "how-to-pass-apex-trader-funding": "How to pass Apex Trader Funding",
  "apex-trader-funding-trailing-drawdown-guia": "Guía del trailing drawdown de Apex Trader Funding",
  "como-pasar-topstep-evaluacion": "Cómo pasar la evaluación de TopStep",
  "how-to-pass-topstep-evaluation": "How to pass the TopStep evaluation",
  "como-pasar-uprofit-evaluacion": "Cómo pasar la evaluación de Uprofit",
  "uprofit-colombia-empresa-fondeo": "Uprofit: la empresa de fondeo para traders de Colombia",
  "que-es-drawdown-trading": "Qué es el drawdown en trading",
  "what-is-drawdown-trading": "What is drawdown in trading",
  "drawdown-trailing-vs-estatico-prop-firms": "Trailing drawdown vs drawdown estático en prop firms",
  "max-daily-loss-como-respetar": "Max daily loss en prop firms: cómo respetarlo",
  "max-daily-loss-fondeo-how-to-manage": "Max daily loss in funded accounts: how to manage it",
  "reglas-riesgo-diario-fondeo": "Reglas de riesgo diario en empresas de fondeo",
  "consistency-rule-fondeo-explicada": "La consistency rule de las prop firms explicada",
  "consistency-rule-prop-firm-explained": "Consistency rule prop firm explained",
  "que-es-un-trading-journal": "Qué es un trading journal y para qué sirve",
  "what-is-a-trading-journal": "What is a trading journal",
  "mejor-journal-trading-futuros-2025": "Mejor journal de trading para futuros 2025",
  "best-trading-journal-prop-firms-2025": "Best trading journal for prop firms 2025",
  "como-llevar-journal-trading-futuros": "Cómo llevar un journal de trading para futuros",
  "zentrade-vs-tradezella": "Zentrade vs TradeZella: comparativa completa",
  "zentrade-vs-tradezella-comparison": "Zentrade vs TradeZella: direct comparison",
  "zentrade-vs-edgewonk": "Zentrade vs Edgewonk: comparativa completa",
  "zentrade-vs-edgewonk-comparison": "Zentrade vs Edgewonk: direct comparison",
  "que-es-una-empresa-de-fondeo": "Qué es una empresa de fondeo y cómo funcionan",
  "mejores-empresas-fondeo-futuros-2025": "Mejores empresas de fondeo para futuros 2025",
  "best-prop-firms-futures-traders-2025": "Best prop firms for futures traders 2025",
  "errores-comunes-evaluaciones-fondeo": "Errores comunes en evaluaciones de fondeo",
  "que-es-revenge-trading": "Qué es el revenge trading y cómo evitarlo",
  "psicologia-trading-futuros": "Psicología del trading para traders de futuros",
  "trading-psychology-futures-traders": "Trading psychology for futures traders",
  "how-to-track-emotions-trading": "How to track emotions in trading",
  "profit-factor-trading-que-es": "Qué es el profit factor en trading",
  "profit-factor-trading-explained": "Profit factor in trading explained",
  "mejores-instrumentos-futuros-principiantes": "Mejores instrumentos de futuros para principiantes",
  "como-operar-nq-maximos-historicos-volatilidad": "Cómo operar el NQ en máximos históricos y alta volatilidad",
  "como-operar-tradovate-prop-firm": "Cómo operar en Tradovate con una prop firm",
  "ninjatrader-journal-trading-futuros": "NinjaTrader y journal de trading para futuros",
};

function getLang(post) {
  if (post.lang) return post.lang;
  return post.author === "Zentrade Team" ? "en" : "es";
}

function buildInternalLinksBlock(slugs, lang) {
  const sectionTitle = lang === "en" ? "You might also like" : "También te puede interesar";
  const items = slugs.map((slug) => {
    const title = titles[slug] || slug;
    return `<a href="/blog/${slug}">${title}</a>`;
  });
  return [
    { type: "divider" },
    { type: "h2", text: sectionTitle },
    { type: "ul", items },
  ];
}

let updated = 0;
let skipped = 0;
let alreadyHas = 0;

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const slug = file.replace(".json", "");
  const slugRelated = related[slug];

  if (!slugRelated) {
    skipped++;
    continue;
  }

  const filePath = path.join(POSTS_DIR, file);
  const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Check if already has an internal links section
  const hasInternal = post.content.some(
    (block) =>
      block.type === "h2" &&
      (block.text === "También te puede interesar" || block.text === "You might also like")
  );

  if (hasInternal) {
    alreadyHas++;
    // Still update relatedSlugs
    post.relatedSlugs = slugRelated;
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf-8");
    continue;
  }

  const lang = getLang(post);
  const newBlocks = buildInternalLinksBlock(slugRelated, lang);
  const content = post.content;

  // Find insertion point: before the first divider that precedes external refs
  // Strategy: find the "Fuentes y recursos oficiales" / "Sources & Official Resources" h2
  // and insert before its preceding divider. If not found, insert before last CTA.
  let insertAt = content.length;

  const refsIdx = content.findIndex(
    (b) =>
      b.type === "h2" &&
      (b.text === "Fuentes y recursos oficiales" || b.text === "Sources & Official Resources")
  );

  if (refsIdx > 0 && content[refsIdx - 1]?.type === "divider") {
    insertAt = refsIdx - 1; // insert before the divider that starts refs section
  } else {
    // Fallback: before last CTA
    for (let i = content.length - 1; i >= 0; i--) {
      if (content[i].type === "cta") {
        insertAt = i;
        break;
      }
    }
  }

  post.content = [
    ...content.slice(0, insertAt),
    ...newBlocks,
    ...content.slice(insertAt),
  ];

  // Add relatedSlugs for the UI cards section
  post.relatedSlugs = slugRelated;

  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf-8");
  updated++;
  console.log(`✓ ${slug} (${lang}) — inserted at ${insertAt}, relatedSlugs: ${slugRelated.length}`);
}

console.log(`\nDone: ${updated} updated, ${alreadyHas} already had, ${skipped} no map defined`);
