import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import icon from "@/data/assets/Favicon-2.png";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zentrade - Journal de Trading",
  description: "Gestiona tu journal de trading de futuros",
  icons: {
    icon: icon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* FOUC prevention: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zentrade-theme');if(t==='light')document.documentElement.classList.add('light-mode')}catch(e){}})()`,
          }}
        />
        {children}
        <Toaster richColors theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
