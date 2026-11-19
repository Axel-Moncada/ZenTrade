import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import icon from "@/data/assets/Favicon-2.png";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { SupportChat } from "@/components/landing/support-chat";
import Script from "next/script";

const GA_ID = "G-DD0ZL0XYVT";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.zen-trader.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zentrade — Trading Journal for Prop Firm Futures Traders",
    template: "%s | Zentrade",
  },
  description:
    "The AI trading journal built to help futures traders pass prop firm evaluations (Apex, TopStep, FTMO). Track drawdown, consistency rules and revenge trading in one place.",
  keywords: [
    "trading journal",
    "futures trading journal",
    "prop firm trading journal",
    "Apex Trader Funding",
    "TopStep",
    "FTMO",
    "TradeZella alternative",
    "consistency rule",
    "trailing drawdown",
    "Zentrade",
  ],
  authors: [{ name: "Zentrade", url: SITE_URL }],
  creator: "Zentrade",
  publisher: "Zentrade",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    url: SITE_URL,
    siteName: "Zentrade",
    title: "Zentrade — Trading Journal for Prop Firm Futures Traders",
    description:
      "Pass your Apex, TopStep or FTMO evaluation with a journal that tracks drawdown, consistency rules and revenge trading.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zentrade — Trading Journal for Prop Firm Futures Traders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentrade — Trading Journal for Prop Firm Futures Traders",
    description:
      "Pass your Apex, TopStep or FTMO evaluation with a journal that tracks drawdown, consistency rules and revenge trading.",
    images: ["/og-image.png"],
    creator: "@zentrade",
  },
  icons: {
    icon: icon.src,
    shortcut: icon.src,
    apple: icon.src,
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Inline script runs before hydration to apply saved theme without flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zentrade-theme');if(t==='light')document.documentElement.classList.add('light-mode');}catch(e){}})();`,
          }}
        />
        {/* llms.txt — descubrimiento para LLMs (ChatGPT, Claude, Perplexity, Gemini) */}
        <link rel="llms-txt" href="/llms.txt" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <SupportChat />
          <Toaster richColors theme="dark" position="bottom-right" />
        </Providers>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  );
}
