import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import icon from "@/data/assets/Favicon-2.png";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import Script from "next/script";

const GA_ID = "G-DD0ZL0XYVT";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://zen-trader.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zentrade — Journal de Trading para Futuros",
    template: "%s | Zentrade",
  },
  description:
    "Journal de trading para futuros con IA. Pasa pruebas de fondeo de FTMO, Apex y TopStep con métricas precisas, revenge trading detection y reportes inteligentes.",
  keywords: [
    "journal de trading",
    "trading journal futuros",
    "pruebas de fondeo futuros",
    "prueba de fondeo",
    "empresa de fondeo",
    "FTMO",
    "Apex Trader Funding",
    "TopStep",
    "Zentrade",
    "trading journal LATAM",
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
    locale: "es_ES",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "Zentrade",
    title: "Zentrade — Journal de Trading para Futuros",
    description:
      "Journal de trading para futuros con IA. Pasa evaluaciones de FTMO, Apex y TopStep con métricas precisas y reportes inteligentes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zentrade — Journal de Trading para Futuros con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentrade — Journal de Trading para Futuros",
    description:
      "Pasa evaluaciones de FTMO, Apex y TopStep con métricas precisas, revenge trading detection y reportes IA semanales.",
    images: ["/og-image.png"],
    creator: "@zentrade",
  },
  icons: {
    icon: icon.src,
    shortcut: icon.src,
    apple: icon.src,
  },
  manifest: "/manifest.json",
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Inline script runs before hydration to apply saved theme without flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zentrade-theme');if(t==='light')document.documentElement.classList.add('light-mode');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
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
