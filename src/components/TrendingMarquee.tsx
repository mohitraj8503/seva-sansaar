"use client";

import { Flame } from "lucide-react";

const TRENDING = [
  { name: "Madhubani Painting", category: "Folk Art", city: "Madhubani", trend: "+42%" },
  { name: "Dokra Metal Craft", category: "Metalwork", city: "Bikna", trend: "+38%" },
  { name: "Handloom Weaving", category: "Textiles", city: "Varanasi", trend: "+35%" },
  { name: "Terracotta Pottery", category: "Pottery", city: "Asharikandi", trend: "+31%" },
  { name: "Pattachitra Art", category: "Folk Art", city: "Raghurajpur", trend: "+28%" },
  { name: "Bamboo Craft", category: "Handicraft", city: "Dimapur", trend: "+25%" },
  { name: "Blue Pottery", category: "Ceramics", city: "Jaipur", trend: "+22%" },
  { name: "Chikankari Embroidery", category: "Textiles", city: "Lucknow", trend: "+19%" },
];

export default function TrendingMarquee() {
  const items = [...TRENDING, ...TRENDING]; // duplicated for a seamless loop

  return (
    <section aria-label="Trending local crafts" className="relative overflow-hidden border-y border-white/10 bg-[#0a1428] py-6">
      <style>{`
        @keyframes seva-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .seva-marquee-track {
          animation: seva-marquee 32s linear infinite;
        }
        .seva-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .seva-marquee-track { animation: none; }
        }
      `}</style>

      <div className="mb-5 flex items-center justify-center gap-2">
        <Flame size={16} className="text-[#FF9933]" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
          Trending Local Crafts
        </h2>
      </div>

      <div className="relative">
        <div className="seva-marquee-track flex w-max items-stretch gap-4 px-4">
          {items.map((item, i) => (
            <article
              key={`${item.name}-${i}`}
              aria-hidden={i >= TRENDING.length}
              className="flex w-56 shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9933]">
                  {item.category}
                </p>
                <h3 className="mt-1 text-sm font-bold text-white">{item.name}</h3>
                <p className="mt-1 text-xs font-medium text-white/50">{item.city}</p>
              </div>
              <span className="mt-3 inline-flex w-fit items-center rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                {item.trend} this week
              </span>
            </article>
          ))}
        </div>

        {/* soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a1428] to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a1428] to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
