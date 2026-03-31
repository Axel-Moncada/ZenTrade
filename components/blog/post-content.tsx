import Link from "next/link";
import { AlertCircle, Lightbulb, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { BlogContentBlock, CalloutVariant } from "@/lib/blog";

interface PostContentProps {
  blocks: BlogContentBlock[];
}

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { icon: React.ReactNode; borderColor: string; iconColor: string; label: string; bgColor: string }
> = {
  tip: {
    icon: <Lightbulb className="w-4 h-4 shrink-0" />,
    borderColor: "border-l-zen-caribbean-green",
    iconColor: "text-zen-caribbean-green",
    bgColor: "bg-zen-caribbean-green/10",
    label: "Consejo",
  },
  info: {
    icon: <AlertCircle className="w-4 h-4 shrink-0" />,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/5",
    label: "Info",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    label: "Atención",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 shrink-0" />,
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    label: "Dato",
  },
};

function RichText({ text }: { text: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: text }}
      className="[&_strong]:font-semibold [&_strong]:text-zen-anti-flash [&_a]:text-zen-caribbean-green [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80"
    />
  );
}

function renderBlock(block: BlogContentBlock, idx: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={idx}
          className="flex items-center gap-3 text-2xl font-bold text-zen-anti-flash mt-12 mb-5 leading-snug scroll-mt-24"
        >
          <span className="shrink-0 w-1 h-7 rounded-full bg-zen-caribbean-green" />
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          key={idx}
          className="text-lg font-semibold text-zen-anti-flash mt-8 mb-3 leading-snug pl-4 border-l border-zen-border-soft"
        >
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p key={idx} className="text-zen-anti-flash/70 leading-[1.8] mb-5 text-[15px]">
          <RichText text={block.text ?? ""} />
        </p>
      );

    case "ul":
      return (
        <ul key={idx} className="space-y-2.5 mb-6 ml-1">
          {(block.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zen-anti-flash/70 text-[15px] leading-relaxed">
              <span className="mt-[7px] w-2 h-2 rounded-full bg-zen-caribbean-green shrink-0 ring-2 ring-zen-caribbean-green/20" />
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={idx} className="space-y-3.5 mb-6 ml-1">
          {(block.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zen-anti-flash/70 text-[15px] leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 text-zen-caribbean-green text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const cfg = CALLOUT_CONFIG[block.variant ?? "info"];
      return (
        <div
          key={idx}
          className={`flex gap-3.5 rounded-xl border border-zen-border-soft border-l-4 ${cfg.borderColor} ${cfg.bgColor} p-4 mb-6`}
        >
          <span className={`${cfg.iconColor} mt-0.5`}>{cfg.icon}</span>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.iconColor} block mb-1.5`}>
              {cfg.label}
            </span>
            <p className="text-sm leading-relaxed text-zen-anti-flash/70">
              <RichText text={block.text ?? ""} />
            </p>
          </div>
        </div>
      );
    }

    case "cta":
      return (
        <div
          key={idx}
          className="relative my-10 rounded-2xl border border-zen-caribbean-green/30 overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute inset-0 bg-zen-caribbean-green/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zen-caribbean-green/60 to-transparent" />

          <div className="relative px-8 py-10 text-center">
            {block.text && (
              <p className="text-zen-anti-flash/70 mb-5 text-sm leading-relaxed max-w-lg mx-auto">
                {block.text}
              </p>
            )}
            <Link
              href={block.href ?? "/register"}
              className="inline-flex items-center gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black font-semibold px-7 py-3 rounded-lg text-sm transition-colors duration-200"
            >
              {block.buttonText ?? "Comenzar ahora"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      );

    case "faq":
      return (
        <div key={idx} className="mb-8 space-y-3">
          {(block.faqItems ?? []).map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-zen-border-soft bg-zen-surface overflow-hidden"
              itemScope
              itemType="https://schema.org/Question"
            >
              <div className="flex items-start gap-3 p-5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 text-zen-caribbean-green text-xs font-bold flex items-center justify-center mt-0.5">
                  Q
                </span>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-zen-anti-flash mb-2.5 text-[15px] leading-snug"
                    itemProp="name"
                  >
                    {item.q}
                  </h3>
                  <div
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <p className="text-zen-anti-flash/60 text-sm leading-relaxed" itemProp="text">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div key={idx} className="mb-8 overflow-x-auto rounded-xl border border-zen-border-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zen-border-soft bg-zen-caribbean-green/10">
                {(block.headers ?? []).map((header, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-zen-anti-flash font-semibold whitespace-nowrap text-xs uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(block.rows ?? []).map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-zen-border-soft last:border-0 transition-colors hover:bg-zen-caribbean-green/5 ${
                    i % 2 === 1 ? "bg-zen-surface" : ""
                  }`}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 text-zen-anti-flash/70 whitespace-nowrap ${
                        j === 0 ? "font-medium text-zen-anti-flash" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      return (
        <figure key={idx} className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src ?? ""}
            alt={block.alt ?? ""}
            className="w-full rounded-xl border border-zen-border-soft"
          />
          {block.caption && (
            <figcaption className="text-center text-xs text-zen-anti-flash/60 mt-3 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return (
        <div key={idx} className="flex items-center justify-center gap-3 my-10">
          <span className="w-1.5 h-1.5 rounded-full bg-zen-border-soft" />
          <span className="w-1.5 h-1.5 rounded-full bg-zen-caribbean-green/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-zen-border-soft" />
        </div>
      );

    default:
      return null;
  }
}

export default function PostContent({ blocks }: PostContentProps) {
  return (
    <>
      {/* Light mode: los strong/a generados por dangerouslySetInnerHTML
          no reciben la clase .text-zen-anti-flash directamente, por lo que
          el override de globals.css no los alcanza. Se corrige aquí. */}
      <style>{`
        html.light-mode main .blog-post-body strong { color: #0C1B14; }
        html.light-mode main .blog-post-body a { color: #007A42; }
        html.light-mode main .blog-post-body a:hover { color: #005a30; }
      `}</style>
      <div className="prose-zen blog-post-body">
        {blocks.map((block, idx) => renderBlock(block, idx))}
      </div>
    </>
  );
}
