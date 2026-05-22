// scripts/add-external-links.js
// Adds "Fuentes y recursos oficiales" section to blog posts before the final CTA block.

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "..", "data", "blog", "posts");

// Map of slug → external reference links (HTML strings)
const refs = {
  "como-pasar-evaluacion-ftmo-journal-trading": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de la evaluación FTMO</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ oficial de FTMO — preguntas frecuentes sobre evaluaciones</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Introducción a los futuros financieros</a>',
  ],
  "como-pasar-apex-trader-funding": [
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Reglas oficiales de Apex Trader Funding</a>',
    '<a href="https://apextraderfunding.com/faq" target="_blank" rel="noopener noreferrer">FAQ oficial de Apex Trader Funding</a>',
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es el Drawdown en trading</a>',
  ],
  "como-pasar-topstep-evaluacion": [
    '<a href="https://www.topstep.com/how-it-works/" target="_blank" rel="noopener noreferrer">Cómo funciona la evaluación de TopStep (oficial)</a>',
    '<a href="https://www.topstep.com/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de TopStep Trading</a>',
    '<a href="https://www.investopedia.com/terms/p/profitfactor.asp" target="_blank" rel="noopener noreferrer">Investopedia — Profit Factor explicado</a>',
  ],
  "como-pasar-uprofit-evaluacion": [
    '<a href="https://uprofit.com/rules" target="_blank" rel="noopener noreferrer">Reglas oficiales de Uprofit</a>',
    '<a href="https://uprofit.com/faq" target="_blank" rel="noopener noreferrer">FAQ oficial de Uprofit</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Conceptos básicos de futuros</a>',
  ],
  "how-to-pass-ftmo-evaluation": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO Official Evaluation Rules</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FTMO Official FAQ — evaluation questions</a>',
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — What is Drawdown in trading</a>',
  ],
  "how-to-pass-apex-trader-funding": [
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding Official Rules</a>',
    '<a href="https://apextraderfunding.com/faq" target="_blank" rel="noopener noreferrer">Apex Trader Funding FAQ</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Introduction to Futures</a>',
  ],
  "how-to-pass-topstep-evaluation": [
    '<a href="https://www.topstep.com/how-it-works/" target="_blank" rel="noopener noreferrer">TopStep — How It Works (official)</a>',
    '<a href="https://www.topstep.com/rules/" target="_blank" rel="noopener noreferrer">TopStep Official Trading Rules</a>',
    '<a href="https://www.investopedia.com/terms/p/prop-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — What is Proprietary Trading</a>',
  ],
  "consistency-rule-fondeo-explicada": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de FTMO — sección de consistency</a>',
    '<a href="https://www.investopedia.com/terms/c/consistency.asp" target="_blank" rel="noopener noreferrer">Investopedia — Consistencia en trading</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — reglas de evaluación (sin consistency rule)</a>',
  ],
  "consistency-rule-prop-firm-explained": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO Official Rules — consistency section</a>',
    '<a href="https://www.investopedia.com/terms/r/riskreward.asp" target="_blank" rel="noopener noreferrer">Investopedia — Risk/Reward Ratio explained</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding Rules (no consistency rule)</a>',
  ],
  "que-es-drawdown-trading": [
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es el Drawdown</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — reglas de drawdown en evaluaciones</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Introducción a los futuros</a>',
  ],
  "what-is-drawdown-trading": [
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — What is a Drawdown</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO Official Rules — drawdown limits</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Introduction to Futures Trading</a>',
  ],
  "max-daily-loss-como-respetar": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales FTMO — max daily loss 5%</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — límite de pérdida diaria</a>',
    '<a href="https://www.investopedia.com/terms/r/risk-management.asp" target="_blank" rel="noopener noreferrer">Investopedia — Gestión de riesgo en trading</a>',
  ],
  "max-daily-loss-fondeo-how-to-manage": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO Official Rules — 5% max daily loss</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — daily loss limits</a>',
    '<a href="https://www.investopedia.com/terms/r/risk-management.asp" target="_blank" rel="noopener noreferrer">Investopedia — Risk Management in Trading</a>',
  ],
  "que-es-una-empresa-de-fondeo": [
    '<a href="https://ftmo.com/en/" target="_blank" rel="noopener noreferrer">FTMO — sitio oficial</a>',
    '<a href="https://apextraderfunding.com/" target="_blank" rel="noopener noreferrer">Apex Trader Funding — sitio oficial</a>',
    '<a href="https://www.investopedia.com/terms/p/prop-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es el trading por cuenta propia (prop trading)</a>',
  ],
  "mejores-empresas-fondeo-futuros-2025": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas y precios oficiales de FTMO</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Reglas y precios oficiales de Apex Trader Funding</a>',
    '<a href="https://www.topstep.com/rules/" target="_blank" rel="noopener noreferrer">Reglas y precios oficiales de TopStep</a>',
  ],
  "best-prop-firms-futures-traders-2025": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO Official Rules & Pricing</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding Official Rules & Pricing</a>',
    '<a href="https://www.topstep.com/rules/" target="_blank" rel="noopener noreferrer">TopStep Official Rules & Pricing</a>',
  ],
  "que-es-un-trading-journal": [
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es un trading journal</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Recursos educativos para traders de futuros</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — reglas que un buen journal debe trackear</a>',
  ],
  "what-is-a-trading-journal": [
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — What is a Trading Journal</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Educational resources for futures traders</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — rules a good journal should track</a>',
  ],
  "que-es-revenge-trading": [
    '<a href="https://www.investopedia.com/terms/r/revenge-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Revenge Trading: definición y cómo evitarlo</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-psychology.asp" target="_blank" rel="noopener noreferrer">Investopedia — Psicología del trading</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — reglas de riesgo que el revenge trading viola</a>',
  ],
  "psicologia-trading-futuros": [
    '<a href="https://www.investopedia.com/terms/t/trading-psychology.asp" target="_blank" rel="noopener noreferrer">Investopedia — Psicología del trading explicada</a>',
    '<a href="https://www.investopedia.com/terms/r/revenge-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Revenge trading: señales y prevención</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Formación para traders de futuros</a>',
  ],
  "trading-psychology-futures-traders": [
    '<a href="https://www.investopedia.com/terms/t/trading-psychology.asp" target="_blank" rel="noopener noreferrer">Investopedia — Trading Psychology explained</a>',
    '<a href="https://www.investopedia.com/terms/r/revenge-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Revenge Trading: how to avoid it</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Education for futures traders</a>',
  ],
  "drawdown-trailing-vs-estatico-prop-firms": [
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — trailing drawdown oficial</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — drawdown estático (basado en capital inicial)</a>',
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — Tipos de drawdown en trading</a>',
  ],
  "apex-trader-funding-trailing-drawdown-guia": [
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Reglas oficiales de Apex Trader Funding — trailing drawdown</a>',
    '<a href="https://apextraderfunding.com/faq" target="_blank" rel="noopener noreferrer">FAQ oficial de Apex — preguntas sobre el trailing drawdown</a>',
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — Drawdown: tipos y cálculo</a>',
  ],
  "regla-consistencia-ftmo-explicada": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de FTMO — consistency rule</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ de FTMO — preguntas sobre verificación y consistencia</a>',
    '<a href="https://www.investopedia.com/terms/r/risk-reward-ratio.asp" target="_blank" rel="noopener noreferrer">Investopedia — Ratio riesgo/recompensa</a>',
  ],
  "reglas-riesgo-diario-fondeo": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas de riesgo diario de FTMO</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Reglas de riesgo diario de Apex Trader Funding</a>',
    '<a href="https://www.investopedia.com/terms/r/risk-management.asp" target="_blank" rel="noopener noreferrer">Investopedia — Gestión de riesgo profesional</a>',
  ],
  "reglas-riesgo-ftmo-futuros-drawdown-consistency": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de FTMO — completas</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ de FTMO — aclaraciones sobre reglas de riesgo</a>',
    '<a href="https://www.investopedia.com/terms/d/drawdown.asp" target="_blank" rel="noopener noreferrer">Investopedia — Drawdown en trading explicado</a>',
  ],
  "errores-comunes-evaluaciones-fondeo": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas de FTMO — los errores más frecuentes que generan</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Reglas de Apex — diferencias clave con FTMO</a>',
    '<a href="https://www.investopedia.com/terms/r/risk-management.asp" target="_blank" rel="noopener noreferrer">Investopedia — Gestión de riesgo en evaluaciones</a>',
  ],
  "pasos-evaluacion-ftmo": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Proceso oficial de evaluación de FTMO</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ de FTMO — dudas frecuentes sobre el proceso</a>',
    '<a href="https://www.investopedia.com/terms/p/prop-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Prop trading: cómo funciona</a>',
  ],
  "ftmo-payout-reparto-ganancias": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas y condiciones de pago oficiales de FTMO</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ de FTMO — preguntas sobre pagos y distribución</a>',
    '<a href="https://www.investopedia.com/terms/p/profit-sharing.asp" target="_blank" rel="noopener noreferrer">Investopedia — Profit sharing en trading</a>',
  ],
  "ftmo-swing-account-vs-regular-cuando-elegir": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">Reglas oficiales de FTMO — cuenta Swing vs Regular</a>',
    '<a href="https://ftmo.com/en/faq/" target="_blank" rel="noopener noreferrer">FAQ de FTMO — diferencias entre tipos de cuenta</a>',
    '<a href="https://www.investopedia.com/terms/s/swingtrading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es el swing trading</a>',
  ],
  "mejor-journal-trading-futuros-2025": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — métricas que todo buen journal debe incluir</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Cómo llevar un trading journal efectivo</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Recursos para traders de futuros</a>',
  ],
  "best-trading-journal-prop-firms-2025": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — metrics every trading journal should track</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — How to keep an effective trading journal</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Educational resources for futures traders</a>',
  ],
  "zentrade-vs-tradezella": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — métricas clave para evaluaciones</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — reglas de trailing drawdown</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué hace útil a un trading journal</a>',
  ],
  "zentrade-vs-tradezella-comparison": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — key metrics for evaluations</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — trailing drawdown rules</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — What makes a trading journal valuable</a>',
  ],
  "zentrade-vs-edgewonk": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — métricas de evaluación que Zentrade trackea</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — reglas de trailing drawdown</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué hace útil a un trading journal</a>',
  ],
  "zentrade-vs-edgewonk-comparison": [
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — prop firm metrics Zentrade tracks natively</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — trailing drawdown rules explained</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — What makes a trading journal valuable</a>',
  ],
  "profit-factor-trading-que-es": [
    '<a href="https://www.investopedia.com/terms/p/profitfactor.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué es el Profit Factor</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — métricas de evaluación que incluyen profit factor</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Métricas para traders de futuros</a>',
  ],
  "profit-factor-trading-explained": [
    '<a href="https://www.investopedia.com/terms/p/profitfactor.asp" target="_blank" rel="noopener noreferrer">Investopedia — Profit Factor explained</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — evaluation metrics including profit factor</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Metrics for futures traders</a>',
  ],
  "como-llevar-journal-trading-futuros": [
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Cómo llevar un trading journal efectivo</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — métricas que tu journal debe registrar</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Recursos educativos para traders de futuros</a>',
  ],
  "mejores-instrumentos-futuros-principiantes": [
    '<a href="https://www.cmegroup.com/trading/equity-index/us-index/e-mini-sandp500.html" target="_blank" rel="noopener noreferrer">CME Group — E-mini S&P 500 (ES): especificaciones oficiales</a>',
    '<a href="https://www.cmegroup.com/trading/equity-index/us-index/e-mini-nasdaq-100.html" target="_blank" rel="noopener noreferrer">CME Group — E-mini Nasdaq-100 (NQ): especificaciones oficiales</a>',
    '<a href="https://www.investopedia.com/terms/f/futures.asp" target="_blank" rel="noopener noreferrer">Investopedia — Qué son los futuros financieros</a>',
  ],
  "como-operar-nq-maximos-historicos-volatilidad": [
    '<a href="https://www.cmegroup.com/trading/equity-index/us-index/e-mini-nasdaq-100.html" target="_blank" rel="noopener noreferrer">CME Group — Especificaciones del contrato E-mini Nasdaq-100</a>',
    '<a href="https://www.investopedia.com/terms/v/volatility.asp" target="_blank" rel="noopener noreferrer">Investopedia — Volatilidad en mercados de futuros</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — reglas durante alta volatilidad</a>',
  ],
  "como-operar-tradovate-prop-firm": [
    '<a href="https://tradovate.com/" target="_blank" rel="noopener noreferrer">Tradovate — plataforma oficial de trading de futuros</a>',
    '<a href="https://apextraderfunding.com/rules" target="_blank" rel="noopener noreferrer">Apex Trader Funding — compatible con Tradovate</a>',
    '<a href="https://www.cmegroup.com/education/courses/introduction-to-futures.html" target="_blank" rel="noopener noreferrer">CME Group — Recursos para traders de futuros en plataformas modernas</a>',
  ],
  "ninjatrader-journal-trading-futuros": [
    '<a href="https://ninjatrader.com/" target="_blank" rel="noopener noreferrer">NinjaTrader — plataforma oficial de trading de futuros</a>',
    '<a href="https://www.cmegroup.com/trading/equity-index/us-index/e-mini-sandp500.html" target="_blank" rel="noopener noreferrer">CME Group — Futuros disponibles en NinjaTrader</a>',
    '<a href="https://www.investopedia.com/terms/t/trading-journal.asp" target="_blank" rel="noopener noreferrer">Investopedia — Beneficios de un trading journal con datos reales</a>',
  ],
  "uprofit-colombia-empresa-fondeo": [
    '<a href="https://uprofit.com/rules" target="_blank" rel="noopener noreferrer">Reglas oficiales de Uprofit</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — alternativa global con sede en Europa</a>',
    '<a href="https://www.investopedia.com/terms/p/prop-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Prop trading: cómo funciona para traders de LATAM</a>',
  ],
  "how-to-track-emotions-trading": [
    '<a href="https://www.investopedia.com/terms/t/trading-psychology.asp" target="_blank" rel="noopener noreferrer">Investopedia — Trading Psychology and emotional discipline</a>',
    '<a href="https://www.investopedia.com/terms/r/revenge-trading.asp" target="_blank" rel="noopener noreferrer">Investopedia — Revenge Trading: how emotions sabotage traders</a>',
    '<a href="https://ftmo.com/en/rules/" target="_blank" rel="noopener noreferrer">FTMO — how emotional consistency impacts evaluation success</a>',
  ],
};

// Determine section title and type based on language
function getLang(post) {
  if (post.lang) return post.lang;
  return post.author === "Zentrade Team" ? "en" : "es";
}

function buildRefsSection(links, lang) {
  const title = lang === "en" ? "Sources & Official Resources" : "Fuentes y recursos oficiales";
  return [
    { type: "divider" },
    { type: "h2", text: title },
    {
      type: "ul",
      items: links,
    },
  ];
}

let updated = 0;
let skipped = 0;
let alreadyHas = 0;

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const slug = file.replace(".json", "");
  if (!refs[slug]) {
    skipped++;
    continue;
  }

  const filePath = path.join(POSTS_DIR, file);
  const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Check if already has references section
  const hasRefs = post.content.some(
    (block) =>
      block.type === "h2" &&
      (block.text === "Fuentes y recursos oficiales" ||
        block.text === "Sources & Official Resources")
  );

  if (hasRefs) {
    alreadyHas++;
    continue;
  }

  const lang = getLang(post);
  const newBlocks = buildRefsSection(refs[slug], lang);

  // Find insertion point: before the last CTA block, or before last FAQ+CTA
  // Strategy: insert before the last block if it's a CTA, else append
  const content = post.content;
  let insertAt = content.length; // default: append

  // Find last CTA
  for (let i = content.length - 1; i >= 0; i--) {
    if (content[i].type === "cta") {
      insertAt = i;
      break;
    }
  }

  post.content = [
    ...content.slice(0, insertAt),
    ...newBlocks,
    ...content.slice(insertAt),
  ];

  fs.writeFileSync(filePath, JSON.stringify(post, null, 2), "utf-8");
  updated++;
  console.log(`✓ ${slug} (${lang}) — inserted before block ${insertAt}`);
}

console.log(`\nDone: ${updated} updated, ${alreadyHas} already had refs, ${skipped} no refs defined`);
