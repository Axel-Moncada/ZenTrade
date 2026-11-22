import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed | Zentrade",
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const invalid = status === "invalid";
  return (
    <main className="flex min-h-screen items-center justify-center bg-zen-rich-black px-4">
      <div className="max-w-md rounded-2xl border border-zen-anti-flash/10 bg-[#00252A] p-8 text-center">
        <h1 className="text-2xl font-bold text-zen-anti-flash">
          {invalid ? "This unsubscribe link isn't valid" : "You're unsubscribed"}
        </h1>
        <p className="mt-3 text-[#B8C2C4]">
          {invalid
            ? "The link may be incomplete. Email support@zen-trader.com and we'll remove you right away."
            : "You won't receive marketing emails from Zentrade anymore. Account emails, like password resets and receipts, will still arrive."}
        </p>
        <Link href="/" className="mt-6 inline-block text-zen-caribbean-green hover:underline">
          Back to zen-trader.com
        </Link>
      </div>
    </main>
  );
}
