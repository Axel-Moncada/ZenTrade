"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// IDs de los videos de YouTube
const VIDEOS = {
  demo: {
    id: "HX9NFOZTj3U", // "Un trading journal con IA diseñado para los traders de futuros"
    title: "Un trading journal con IA diseñado para los traders de futuros",
    label: "Demo del producto",
  },
  usecase: {
    id: "uf-zP071AcE", // "Deja el Excel — Esto es lo que uso para mis pruebas de fondeo"
    title: "Deja el Excel — Esto es lo que uso para mis pruebas de fondeo",
    label: "Caso de uso real",
  },
};

type VideoKey = keyof typeof VIDEOS;

export default function PreviewSection() {
  const [active, setActive] = useState<VideoKey>("demo");
  const [playing, setPlaying] = useState(false);
  const video = VIDEOS[active];

  const handleTabChange = (key: VideoKey) => {
    setActive(key);
    setPlaying(false);
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/25 to-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zen-caribbean-green/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-zen-caribbean-green mb-4">
            Ve Zentrade en acción
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-4">
            Un vistazo al{" "}
            <span className="text-zen-caribbean-green">dashboard real</span>
          </h2>
          <p className="text-zen-text-muted text-lg">
            Sin demos fabricados — el mismo dashboard que usan los traders que pasan evaluaciones.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(Object.keys(VIDEOS) as VideoKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === key
                  ? "bg-zen-caribbean-green text-zen-rich-black"
                  : "bg-zen-surface border border-zen-border-soft text-zen-anti-flash/60 hover:text-zen-anti-flash hover:border-zen-caribbean-green/30"
              }`}
            >
              {VIDEOS[key].label}
            </button>
          ))}
        </div>

        {/* Video container */}
        <div className="relative rounded-2xl overflow-hidden border border-zen-caribbean-green/30 shadow-2xl shadow-zen-caribbean-green/10 bg-zen-rich-black">
          {/* Browser chrome bar */}
          <div className="bg-zen-surface border-b border-zen-border-soft px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zen-danger/50" />
              <div className="w-3 h-3 rounded-full bg-zen-caribbean-green/50" />
              <div className="w-3 h-3 rounded-full bg-zen-mountain-meadow/50" />
            </div>
            <div className="flex-1 bg-zen-rich-black rounded px-3 py-1 text-xs text-zen-text-muted truncate">
              youtube.com/@Zen-trade_Latam
            </div>
          </div>

          {/* 16:9 video area */}
          <div className="relative w-full aspect-video bg-zen-rich-black">
            {playing ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {/* YouTube thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Play overlay */}
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-zen-rich-black/50 hover:bg-zen-rich-black/30 transition-all duration-200 group"
                  aria-label={`Reproducir: ${video.title}`}
                >
                  <div className="w-20 h-20 bg-zen-caribbean-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-2xl shadow-zen-caribbean-green/50">
                    <Play className="h-9 w-9 text-zen-rich-black ml-1" fill="currentColor" />
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-zen-text-muted text-sm">
          <span className="text-zen-caribbean-green font-semibold">Plan Free permanente</span> — Regístrate y empieza sin tarjeta de crédito
        </p>
      </div>
    </section>
  );
}
