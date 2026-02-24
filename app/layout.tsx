import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import icon from "@/data/assets/Favicon-2.png";
import { Toaster } from "sonner";
import { Providers } from "./providers";

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
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors theme="dark" position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
