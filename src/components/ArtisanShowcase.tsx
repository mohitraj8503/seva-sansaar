"use client";

import { BadgeCheck, MapPin, Star } from "lucide-react";
import Image from "next/image";

const ARTISANS = [
  { name: "Meera Devi", craft: "Madhubani Painting", city: "Madhubani", rating: "4.9", reviews: 212, img: "https://i.pravatar.cc/400?img=47" },
  { name: "Sukhen Karmakar", craft: "Dokra Metal Craft", city: "Bikna", rating: "4.8", reviews: 167, img: "https://i.pravatar.cc/400?img=12" },
  { name: "Anita Ansari", craft: "Handloom Weaving", city: "Varanasi", rating: "4.9", reviews: 298, img: "https://i.pravatar.cc/400?img=32" },
  { name: "Dinesh Pal", craft: "Terracotta Pottery", city: "Asharikandi", rating: "4.7", reviews: 143, img: "https://i.pravatar.cc/400?img=53" },
  { name: "Subhadra Maharana", craft: "Pattachitra Art", city: "Raghurajpur", rating: "5.0", reviews: 186, img: "https://i.pravatar.cc/400?img=44" },
  { name: "Ramesh Kumhar", craft: "Blue Pottery", city: "Jaipur", rating: "4.8", reviews: 154, img: "https://i.pravatar.cc/400?img=59" },
];

export default function ArtisanShowcase() {
  return (
    <section aria-label="Verified artisan showcase" className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
              Handpicked Masters
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-[#1a2d5c] md:text-5xl">
            Verified Artisan Showcase
          </h2>
          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-500 md:text-base">
            Every artisan below is background-verified and skill-assessed by Seva Sansaar —
            look for the green ribbon.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTISANS.map((artisan) => (
            <article
              key={artisan.name}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* verified ribbon */}
              <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                <BadgeCheck size={12} aria-hidden="true" />
                Verified
              </div>

              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={artisan.img}
                  alt={`Portrait of ${artisan.name}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900">{artisan.name}</h3>
                <p className="mt-1 text-sm font-medium text-gray-500">{artisan.craft}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                    <MapPin size={12} className="text-gray-400" aria-hidden="true" />
                    {artisan.city}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {artisan.rating}
                    <span className="text-xs font-medium text-gray-400">({artisan.reviews})</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
