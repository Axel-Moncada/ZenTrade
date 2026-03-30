import Link from "next/link";
import { AlertCircle, Lightbulb, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { BlogContentBlock, CalloutVariant } from "@/lib/blog";

interface PostContentProps {
  blocks: BlogContentBlock[];
}

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { icon: React.ReactNode; classes: string; labelClass: string; label: string }
> = {
  tip: {
    icon: <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />,
    classes: "bg-zen-caribbean-green/5 border-zen-caribbean-green/30 text-zen-anti-flash",
    labelClass: "text-zen-caribbean-green",
    label: "Consejo",
  },
  info: {
    icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    classes: "bg-blue-500/5 border-blue-500/30 text-zen-anti-flash",
    labelClass: "text-blue-400",
    label: "Info",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    classes: "bg-amber-500/5 border-amber-500/30 text-zen-anti-flash",
    labelClass: "text-amber-400",
    label: "Atención",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />,
    classes: "bg-emerald-500/5 border-emerald-500/30 text-zen-anti-flash",
    labelClass: "text-emerald-400",
    label: "Dato",
  },
};

function RichText({ text }: { text: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: text }}
      className="[&_strong]:font-semibold [&_strong]:text-zen-anti-flash [&_a]:text-zen-caribbean-green [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-zen-caribbean-green/80"
    />
  );
}

function renderBlock(block: BlogContentBlock, idx: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={idx}
          className="text-2xl font-bold text-zen-anti-flash mt-10 mb-4 leading-snug scroll-mt-24"
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          key={idx}
          className="text-lg font-semibold text-zen-anti-flash mt-8 mb-3 leading-snug"
        >
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p key={idx} className="text-zen-text-muted leading-relaxed mb-5 text-base">
          <RichText text={block.text ?? ""} />
        </p>
      );

    case "ul":
      return (
        <ul key={idx} className="space-y-2 mb-6 ml-1">
          {(block.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-zen-text-muted text-base">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zen-caribbean-green shrink-0" />
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={idx} className="space-y-3 mb-6 ml-1">
          {(block.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zen-text-muted text-base">
              <span className="shrink-0 w-6 h-6 rounded-full bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 text-zen-caribbean-green text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const config = CALLOUT_CONFIG[block.variant ?? "info"];
      return (
        <div
          key={idx}
          className={`flex gap-3 rounded-xl border p-4 mb-6 ${config.classes}`}
        >
          <span className={config.labelClass}>{config.icon}</span>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${config.labelClass} block mb-1`}>
              {config.label}
            </span>
            <p className="text-sm leading-relaxed">
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
          className="my-8 rounded-2xl border border-zen-caribbean-green/30 bg-zen-caribbean-green/5 p-8 text-center"
        >
          {block.text && (
            <p className="text-zen-text-muted mb-4 text-sm leading-relaxed max-w-lg mx-auto">
              {block.text}
            </p>
          )}
          <Link
            href={block.href ?? "/register"}
            className="inline-flex items-center gap-2 bg-zen-caribbean-green hover:bg-zen-caribbean-green/90 text-zen-rich-black font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            {block.buttonText ?? "Comenzar ahora"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );

    case "faq":
      return (
        <div key={idx} className="mb-8 space-y-4">
          {(block.faqItems ?? []).map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-zen-border-soft bg-zen-surface p-5"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3
                className="font-semibold text-zen-anti-flash mb-2 text-base"
                itemProp="name"
              >
                {item.q}
              </h3>
              <div
                itemScope
                itemType="https://schema.org/Answer"
                itemProp="acceptedAnswer"
              >
                <p className="text-zen-text-muted text-sm leading-relaxed" itemProp="text">
                  {item.a}
                </p>
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
              <tr className="border-b border-zen-border-soft bg-zen-surface">
                {(block.headers ?? []).map((header, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-zen-anti-flash font-semibold whitespace-nowrap"
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
                  className={`border-b border-zen-border-soft last:border-0 ${
                    i % 2 === 0 ? "" : "bg-zen-surface/50"
                  }`}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 text-zen-text-muted whitespace-nowrap ${
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
            <figcaption className="text-center text-xs text-zen-text-muted mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr key={idx} className="border-zen-border-soft my-8" />;

    default:
      return null;
  }
}

export default function PostContent({ blocks }: PostContentProps) {
  return (
    <div className="prose-zen">
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
}
