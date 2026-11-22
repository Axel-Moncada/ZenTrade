"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { track } from "@/lib/analytics/track";

const COPY = {
  en: { title: "Watch how it works", sub: "23 seconds. The day you already know, and the alert that changes it.", unmute: "Turn sound on", mute: "Mute", play: "Play video" },
  es: { title: "Mira cómo funciona", sub: "23 segundos. El día que ya conoces y la alerta que lo cambia.", unmute: "Activar sonido", mute: "Silenciar", play: "Reproducir video" },
} as const;

export default function AdVideo() {
  const { locale } = useI18n();
  const c = COPY[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const tracked = useRef(false);

  // Solo carga y reproduce cuando entra en pantalla (no afecta el LCP del hero)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.play().catch(() => undefined);
          }
        } else {
          el.pause();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPlay = () => {
    setPlaying(true);
    if (!tracked.current) {
      tracked.current = true;
      track("video_play", { video: "ad_v3" });
    }
  };

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (el.paused) el.play().catch(() => undefined);
  };

  return (
    <section className="mx-auto max-w-[1040px] px-4 py-20 sm:px-6 md:py-24">
      <div className="mb-8 flex flex-col gap-3 text-center">
        <h2 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] text-zen-anti-flash md:text-[46px]">{c.title}</h2>
        <p className="text-[17px] text-[#B8C2C4]">{c.sub}</p>
      </div>
      <div className="relative overflow-hidden rounded-[18px] border border-zen-anti-flash/10 bg-black shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
        <video
          ref={videoRef}
          className="block aspect-video w-full"
          src={load ? "/videos/zentrade-ad.mp4" : undefined}
          poster="/videos/zentrade-ad-poster.webp"
          muted
          playsInline
          loop
          preload="none"
          onPlay={onPlay}
          onPause={() => setPlaying(false)}
          aria-label={c.title}
        />
        {!playing && (
          <button
            type="button"
            onClick={() => {
              setLoad(true);
              requestAnimationFrame(() => videoRef.current?.play().catch(() => undefined));
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/10"
            aria-label={c.play}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zen-caribbean-green text-zen-rich-black shadow-[0_0_40px_rgba(0,193,124,0.45)]">
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-2 text-sm font-semibold text-zen-anti-flash backdrop-blur transition hover:bg-black/80"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? c.unmute : c.mute}
        </button>
      </div>
    </section>
  );
}
