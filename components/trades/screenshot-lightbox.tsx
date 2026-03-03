"use client";

import { useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotLightboxProps {
  urls: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScreenshotLightbox({
  urls,
  currentIndex,
  onIndexChange,
  open,
  onOpenChange,
}: ScreenshotLightboxProps) {
  const total = urls.length;

  const prev = useCallback(() => {
    onIndexChange((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((currentIndex + 1) % total);
  }, [currentIndex, total, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prev, next]);

  if (!urls[currentIndex]) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black/95 border-zen-forest/40 overflow-hidden [&>button]:hidden">
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/60 hover:bg-zen-danger/70 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Counter */}
          {total > 1 && (
            <div className="absolute top-3 left-3 z-10 text-white/70 text-xs bg-black/60 px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {total}
            </div>
          )}

          {/* Prev */}
          {total > 1 && (
            <button
              onClick={prev}
              className="absolute left-3 z-10 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Image */}
          <img
            src={urls[currentIndex]}
            alt={`Captura ${currentIndex + 1} de ${total}`}
            className="max-h-[80vh] max-w-full object-contain select-none"
            draggable={false}
          />

          {/* Next */}
          {total > 1 && (
            <button
              onClick={next}
              className="absolute right-3 z-10 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentIndex
                      ? "bg-zen-caribbean-green scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
