"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

interface CTAButtonProps {
  variant?: "primary" | "secondary";
  size?: "default" | "lg";
  showIcon?: boolean;
  className?: string;
  href?: string;
}

export default function CTAButton({
  variant = "primary",
  size = "default",
  showIcon = true,
  className = "",
  href = "/login",
}: CTAButtonProps) {
  const { t } = useI18n();
  const l = t.landing;

  if (variant === "secondary") {
    return (
      <Link href={href}>
        <Button
          size={size}
          className={`group border-2 border-zen-caribbean-green text-zen-caribbean-green hover:bg-zen-caribbean-green hover:text-zen-rich-black transition-all font-semibold ${className}`}
        >
          {showIcon && <Sparkles className="mr-2 h-4 w-4" />}
          {l.ctaSecondary}
          {showIcon && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <Button
        size={size}
        className={`group bg-zen-caribbean-green text-zen-rich-black hover:bg-zen-mountain-meadow shadow-lg shadow-zen-caribbean-green/30 hover:shadow-zen-caribbean-green/50 transition-all font-semibold ${className}`}
      >
        {showIcon && <Sparkles className="mr-2 h-4 w-4" />}
        {l.ctaPrimary}
        {showIcon && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </Button>
    </Link>
  );
}
