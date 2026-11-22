import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Create your free Zentrade account and start journaling your trades today.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
