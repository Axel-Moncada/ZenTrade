import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AiFeaturesSection from "@/components/landing/sections/ai-features-section";
import FeaturesSection from "@/components/landing/sections/features-section";
import PricingSection from "@/components/landing/sections/pricing-section";
import BenefitsSection from "@/components/landing/sections/benefits-section";
import FaqSection from "@/components/landing/sections/faq-section";
import ReplayHero from "@/components/landing/sections/replay-hero";
import ResetCalculator from "@/components/landing/sections/reset-calculator";
import AdVideo from "@/components/landing/sections/ad-video";
import RulesShowcase from "@/components/landing/sections/rules-showcase";
import FinalCta from "@/components/landing/sections/final-cta";
import AttributionCapture from "@/components/landing/attribution-capture";
import PublicNavbar from "@/components/landing/public-navbar";
import PublicFooter from "@/components/landing/public-footer";
import NewsletterPopup from "@/components/landing/newsletter-popup";
import { getPublicReviews } from "@/lib/reviews/get-public-reviews";
import { MIN_REVIEWS_FOR_RATING_SCHEMA } from "@/lib/reviews/reviews";

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  title: "Zentrade — AI Trading Journal for Prop Firm Traders | Free",
  description:
    "The AI trading journal built for futures traders passing prop firm evaluations. Track consistency score, drawdown and detect revenge trading in real time. FTMO, Apex, TopStep.",
  keywords: [
    "trading journal",
    "futures trading journal",
    "prop firm trading journal",
    "best trading journal",
    "FTMO journal",
    "Apex Trader Funding journal",
    "TopStep journal",
    "Zentrade",
    "trading journal for prop firms",
    "how to pass prop firm evaluation",
    "AI trading journal",
    "prop firm tracker",
    "consistency score tracker",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "AI Trading Journal for Prop Firm Evaluations | Zentrade",
    description:
      "AI-powered trading journal for futures traders. FTMO, Apex and TopStep metrics, revenge trading detection and weekly AI report — free plan included.",
    url: SITE_URL,
    type: "website",
  },
};

// JSON-LD schemas para Google, Bing y LLMs
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zentrade",
  alternateName: ["ZenTrade", "Zen Trade"],
  description:
    "AI trading journal for futures traders working to pass prop firm evaluations (Apex Trader Funding, TopStep, FTMO, Uprofit, Tradoverse). Live discipline copilot, revenge trading detection, weekly AI report and prop firm metrics in real time.",
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: ["en", "es"],
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "Free forever: 1 account, unlimited manual trade logging",
    },
    {
      "@type": "Offer",
      name: "Starter",
      price: "9",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "2 accounts, CSV export, trade calendar",
    },
    {
      "@type": "Offer",
      name: "Professional",
      price: "29",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "Unlimited accounts, CSV import, full analytics, trading plan PDF",
    },
    {
      "@type": "Offer",
      name: "ZenMode",
      price: "59",
      priceCurrency: "USD",
      billingPeriod: "P1M",
      description: "Everything in Professional + live discipline copilot, revenge trading detection, ZenCoach AI, weekly AI report and Market Radar",
    },
  ],
  featureList: [
    "Trading journal for futures (NQ, ES, CL, GC, MES, MNQ and more)",
    "Analytics dashboard with prop firm evaluation metrics",
    "Live discipline copilot that flags rule breaks during your session",
    "Automatic revenge trading detection",
    "CSV import from NinjaTrader, Rithmic and Tradovate",
    "Weekly AI performance report",
    "Weekly Market Radar of high-impact events",
    "Consistency score for Apex Trader Funding, TopStep and FTMO",
    "Equity curve and advanced metrics",
    "Emotion tracking calendar",
    "Multi-account support (evaluation + funded accounts)",
    "Daily loss limit and trailing drawdown tracking",
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zentrade",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/Logo hori-white.png`,
  description:
    "Zentrade is the AI trading journal for futures traders working to pass prop firm evaluations such as Apex Trader Funding, TopStep, FTMO, Uprofit and Tradoverse.",
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    addressCountry: "CO",
    name: "Colombia",
  },
  areaServed: [
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "Colombia" },
    { "@type": "Country", name: "Mexico" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@zen-trader.com",
    contactType: "customer support",
    availableLanguage: ["English", "Spanish"],
  },
  sameAs: [
    "https://www.linkedin.com/company/zen-trader",
    "https://www.youtube.com/@Zen-trade_Latam",
    "https://x.com/ZenTrader_IA",
    "https://twitter.com/ZenTrader_IA",
  ],
};

// SiteNavigationElement — ayuda a Google a generar sitelinks
const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Zentrade main navigation",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Trading Blog",
      description: "Guides, comparisons and strategies for futures traders",
      url: `${SITE_URL}/blog`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Pricing",
      description: "From a free-forever plan to ZenMode with AI, no card required",
      url: `${SITE_URL}/pricing`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Create a free account",
      description: "Sign up and start using Zentrade at no cost",
      url: `${SITE_URL}/register`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Log in",
      description: "Access your trading journal",
      url: `${SITE_URL}/login`,
    },
  ],
};

// Video del anuncio que se muestra en la landing (sección AdVideo)
const videoSchema = [
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "You didn't fail your eval because of your strategy",
    description:
      "23-second overview of Zentrade: the trading journal that tracks your prop firm's trailing drawdown and consistency rule live and flags revenge trades after a loss.",
    thumbnailUrl: `${SITE_URL}/videos/zentrade-ad-poster.webp`,
    contentUrl: `${SITE_URL}/videos/zentrade-ad.mp4`,
    uploadDate: "2026-11-22",
    duration: "PT23S",
    inLanguage: "en",
    publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
  },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zentrade",
  url: SITE_URL,
  description: "AI trading journal for futures traders passing prop firm evaluations",
  inLanguage: ["en", "es"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Zentrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade is an AI trading journal built for futures traders. You can log or import trades, analyze performance metrics, get alerted when you break your own rules during a live session, detect revenge trading automatically and receive a weekly AI report. It is designed for traders working through prop firm evaluations such as Apex Trader Funding, TopStep, FTMO, Uprofit and Tradoverse.",
      },
    },
    {
      "@type": "Question",
      name: "How is Zentrade different from TradeZella, Tradervue or Edgewonk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade is built specifically around prop firm rules: it tracks consistency score, daily loss limit and trailing drawdown per account, and its live discipline copilot warns you before you break a rule. Paid plans start at $9/month and there is a free-forever plan.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Zentrade cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade has a free-forever plan. Paid plans are Starter at $9/month, Professional at $29/month and ZenMode at $59/month. Billed annually: Starter $84/year, Professional $249/year, ZenMode $499/year. No credit card is required to start.",
      },
    },
    {
      "@type": "Question",
      name: "Does Zentrade have a free plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Free plan is free forever and includes 1 account, unlimited manual trade logging, a KPI dashboard and a monthly calendar. No credit card and no expiration date.",
      },
    },
    {
      "@type": "Question",
      name: "Can Zentrade help me pass Apex Trader Funding, TopStep or FTMO evaluations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zentrade tracks the metrics prop firms evaluate you on: daily loss limit, trailing drawdown, consistency score and profit factor. You can see in real time whether you are within your firm's rules, and the live copilot alerts you before you break them.",
      },
    },
    {
      "@type": "Question",
      name: "Which trading platforms does Zentrade support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CSV import from NinjaTrader, Rithmic and Tradovate, or from any platform using the Zentrade CSV template. You can also log any trade manually.",
      },
    },
    {
      "@type": "Question",
      name: "Is my trading data private and secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Zentrade uses database Row Level Security (RLS), so each user can only access their own data.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my subscription at any time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, with no commitments or penalties. Cancel from your billing page at any time and keep access until the end of your paid period.",
      },
    },
  ],
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reviewStats = await getPublicReviews();
  // AggregateRating SOLO con reseñas reales aprobadas (nunca valores fijos)
  const softwareSchema =
    reviewStats.ratingCount >= MIN_REVIEWS_FOR_RATING_SCHEMA
      ? {
          ...softwareAppSchema,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewStats.ratingValue.toFixed(1),
            ratingCount: String(reviewStats.ratingCount),
            bestRating: "5",
          },
        }
      : softwareAppSchema;

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-zen-rich-black via-zen-dark-green to-zen-rich-black">
      {/* JSON-LD structured data — leído por Google, Bing y LLMs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            softwareSchema,
            organizationSchema,
            websiteSchema,
            faqSchema,
            siteNavigationSchema,
            ...videoSchema,
          ]),
        }}
      />

      <AttributionCapture />
      <PublicNavbar isAuthenticated={!!user} />
      <main>
        <ReplayHero />
        <ResetCalculator />
        <AdVideo />
        <RulesShowcase />
        <AiFeaturesSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <BenefitsSection realTestimonials={reviewStats.testimonials} />
        <section id="pricing">
          <PricingSection />
        </section>
        <section id="faq">
          <FaqSection />
        </section>
        <FinalCta />
      </main>
      <PublicFooter />
      <NewsletterPopup />
    </div>
  );
}
