import type { Metadata } from "next";
import Link from "next/link";
import { Download, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ToolPage, type ToolFaq } from "@/components/tools/tool-page";

const SITE_URL = "https://www.zen-trader.com";
const URL = `${SITE_URL}/trading-journal-template`;
const FILE = "/downloads/zentrade-trading-journal-template.xlsx";

export const metadata: Metadata = {
  title: "Free Trading Journal Template (Excel & Google Sheets) for Futures Traders",
  description:
    "Download a free trading journal template for Excel and Google Sheets. Built for futures and prop firm traders: P&L, win rate, profit factor, drawdown and consistency rule, calculated automatically.",
  keywords: [
    "trading journal template",
    "free trading journal template",
    "trading journal excel",
    "trading journal google sheets",
    "futures trading journal template",
    "prop firm trading journal template",
    "how to start a trading journal",
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: "Free Trading Journal Template for Futures and Prop Firm Traders",
    description: "Excel and Google Sheets template with automatic stats, drawdown and consistency rule.",
    type: "website",
    url: URL,
  },
};

const faq: ToolFaq[] = [
  {
    q: "What should a trading journal include?",
    a: "At minimum: date, instrument, side, size, entry and exit time, result, exit reason, whether you followed your plan, your emotion and notes. Those last three are what reveal the patterns that cost you money.",
  },
  {
    q: "Does this template work in Google Sheets?",
    a: "Yes. Upload the .xlsx file to Google Drive and open it with Google Sheets. The formulas work in Excel 2019 or later, Excel for Microsoft 365 and Google Sheets.",
  },
  {
    q: "Is a spreadsheet good enough for a prop firm evaluation?",
    a: "It's a solid start. The limits show up when you trade several accounts, want to import trades from your platform, or need a warning during your session before you break a rule. That's what a dedicated journal like Zentrade adds.",
  },
  {
    q: "How often should I fill in my trading journal?",
    a: "After every trade, or at least at the end of every session while the details are fresh. Weekly reviews of your journal are where you find your best hours, setups and the mistakes you repeat.",
  },
  {
    q: "Is the template free?",
    a: "Yes, it's free with no sign-up. You can also use Zentrade's free plan, which journals your trades and tracks your prop firm rules automatically.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DigitalDocument",
      name: "Zentrade Free Trading Journal Template",
      url: URL,
      encodingFormat: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "Zentrade", url: SITE_URL },
    },
    {
      "@type": "HowTo",
      name: "How to start a trading journal",
      step: [
        { "@type": "HowToStep", name: "Download the template", text: "Download the free Excel template or open it in Google Sheets." },
        { "@type": "HowToStep", name: "Enter your account rules", text: "Fill in your starting balance, max drawdown, daily loss limit and consistency threshold." },
        { "@type": "HowToStep", name: "Log every trade", text: "Record each trade with its result, exit reason, whether you followed your plan and your emotion." },
        { "@type": "HowToStep", name: "Review weekly", text: "Check win rate, profit factor, drawdown left and the consistency rule every week." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Free tools", item: `${SITE_URL}/tools` },
        { "@type": "ListItem", position: 3, name: "Trading Journal Template", item: URL },
      ],
    },
  ],
};

function DownloadCard() {
  const items = [
    "Journal sheet with dropdowns for side, exit reason, plan and emotion",
    "Automatic stats: net P&L, win rate, profit factor, average win and loss",
    "Prop firm rules sheet: trailing drawdown floor and drawdown left",
    "Consistency rule check with the net profit you still need",
    "Daily P&L summary built from your trades",
    "Works in Excel and Google Sheets",
  ];
  return (
    <div className="grid gap-6 rounded-2xl border border-zen-caribbean-green/30 bg-zen-surface p-8 md:grid-cols-2">
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zen-anti-flash/85">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zen-caribbean-green" />
            {i}
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <a
          href={FILE}
          download
          className="inline-flex items-center gap-2 rounded-xl bg-zen-caribbean-green px-6 py-3 font-bold text-zen-rich-black transition-colors hover:bg-zen-mountain-meadow"
        >
          <Download className="h-5 w-5" /> Download free template (.xlsx)
        </a>
        <p className="text-xs text-zen-anti-flash/50">No sign-up. Excel 2019+, Microsoft 365 or Google Sheets.</p>
        <Link href="/register" className="text-sm font-semibold text-zen-caribbean-green hover:underline">
          Or skip the spreadsheet: journal for free in Zentrade →
        </Link>
      </div>
    </div>
  );
}

export default async function TradingJournalTemplatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <ToolPage
      isAuthenticated={!!user}
      badge="Free download"
      title="Free Trading Journal Template"
      intro="A free Excel and Google Sheets trading journal built for futures and prop firm traders. Log your trades and get your stats, drawdown and consistency rule calculated automatically."
      calculator={<DownloadCard />}
      sections={[
        {
          h: "How do I start a trading journal?",
          body: (
            <>
              <p>
                <strong>Start simple: log every trade the same day, with the result and one honest line about why you took it.</strong>{" "}
                Consistency matters more than detail. A journal you fill in every day beats a perfect one you abandon in a week.
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Download the template and delete the example rows.</li>
                <li>Enter your account rules: starting balance, max drawdown, daily loss limit and consistency threshold.</li>
                <li>After each trade, log the result, exit reason, whether you followed your plan and how you felt.</li>
                <li>Once a week, review your stats and look for the mistake you repeat most.</li>
              </ol>
            </>
          ),
        },
        {
          h: "What should I track as a prop firm trader?",
          body: (
            <p>
              Beyond P&amp;L, track the numbers your firm grades you on: how much drawdown you have left, your daily loss, and
              how much of your profit came from your best day (the consistency rule). A profitable strategy can still fail an
              evaluation if one of these rules breaks.
            </p>
          ),
        },
        {
          h: "Spreadsheet or trading journal app?",
          body: (
            <p>
              A spreadsheet is free and flexible, and it&apos;s a great way to build the habit. A journal app saves you the manual
              work: Zentrade imports NinjaTrader, Rithmic and Tradovate files, tracks each account&apos;s rules automatically and, on
              ZenMode, warns you during your session before you break a rule. Zentrade also has a free plan.
            </p>
          ),
        },
      ]}
      faq={faq}
      related={[
        { href: "/blog/what-is-a-trading-journal", label: "What is a trading journal?" },
        { href: "/tools/consistency-rule-calculator", label: "Free consistency rule calculator" },
        { href: "/tools/trailing-drawdown-calculator", label: "Free trailing drawdown calculator" },
        { href: "/vs/tradezella", label: "Zentrade vs TradeZella" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
