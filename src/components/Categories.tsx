"use client";

import {
  ArrowRight,
  BookOpen,
  Droplet,
  Scissors,
  Zap,
  LayoutGrid,
  Wrench,
  Sparkles,
  Hammer,
  ShoppingCart,
  Palette,
  TreePine,
  Car,
  Camera,
  UtensilsCrossed,
  ScissorsLineDashed,
  Home,
  Baby,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useMemo } from "react";

const ALL_CATEGORIES = [
  { id: "all", icon: LayoutGrid, name: "All", desc: "Browse full catalog" },
  { id: "electrician", icon: Zap, name: "Electrician", desc: "Wiring, repairs & installations" },
  { id: "plumber", icon: Droplet, name: "Plumber", desc: "Pipe fixes, fitting & maintenance" },
  { id: "tutor", icon: BookOpen, name: "Home Tutor", desc: "All subjects, all classes" },
  { id: "salon", icon: Scissors, name: "Salon & Beauty", desc: "Haircut, facial & styling" },
  { id: "appliance", icon: Wrench, name: "Appliance Repair", desc: "AC, fridge, washing machine" },
  { id: "cleaning", icon: Sparkles, name: "Cleaning", desc: "Deep clean, pest control & more" },
  { id: "repair", icon: Hammer, name: "General Repair", desc: "Carpentry, painting & fixtures" },
  { id: "grocery", icon: ShoppingCart, name: "Grocery", desc: "Daily essentials at doorstep" },
  { id: "painting", icon: Palette, name: "Painting", desc: "Home, office & decorative" },
  { id: "carpentry", icon: TreePine, name: "Carpentry", desc: "Furniture, shelves & fittings" },
  { id: "driving", icon: Car, name: "Driving School", desc: "Learn to drive with experts" },
  { id: "photography", icon: Camera, name: "Photography", desc: "Events, portraits & reels" },
  { id: "catering", icon: UtensilsCrossed, name: "Catering", desc: "Food for events & parties" },
  { id: "tailoring", icon: ScissorsLineDashed, name: "Tailoring", desc: "Stitching, alteration & design" },
  { id: "pest-control", icon: Home, name: "Pest Control", desc: "Termite, rodent & cockroach" },
  { id: "babysitting", icon: Baby, name: "Babysitting", desc: "Trusted childcare at home" },
];

// Color palette for category icons — fixed class names for Tailwind JIT
const COLOR_CLASSES = [
  "bg-amber-50 text-amber-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-rose-50 text-rose-600",
  "bg-purple-50 text-purple-600",
  "bg-cyan-50 text-cyan-600",
  "bg-orange-50 text-orange-600",
  "bg-teal-50 text-teal-600",
  "bg-indigo-50 text-indigo-600",
  "bg-pink-50 text-pink-600",
  "bg-lime-50 text-lime-600",
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-600",
  "bg-fuchsia-50 text-fuchsia-600",
  "bg-green-50 text-green-600",
  "bg-red-50 text-red-600",
  "bg-yellow-50 text-yellow-600",
];

// Visible categories on homepage (top picks)
const VISIBLE_COUNT = 8;

export default function Categories({
  onSelect,
  activeCategory,
}: {
  onSelect?: (cat: string) => void;
  activeCategory?: string;
}) {
  const t = useTranslations("Categories");
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = useMemo(
    () => (showAll ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, VISIBLE_COUNT)),
    [showAll]
  );

  const activeId = activeCategory ?? "all";

  return (
    <section
      id="categories"
      className="py-16 md:py-24 bg-white relative overflow-hidden border-t border-gray-100"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-saffron/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-saffron mb-3">
              {t("enTitle")}
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tight leading-tight">
              {t("title")}
            </h2>
          </div>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-sm leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Category Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          role="group"
          aria-label="Service categories"
        >
          {visibleCategories.map(({ id, icon: Icon, name, desc }, index) => {
            const isActive = activeId === id;
            const colorIdx = index % COLOR_CLASSES.length;

            return (
              <button
                key={id}
                onClick={() => onSelect?.(id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${name} — ${desc}`}
                className={`group relative min-h-[140px] md:min-h-[180px] rounded-2xl md:rounded-3xl p-4 sm:p-5 transition-all duration-300 ease-out text-left border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                  isActive
                    ? "bg-navy border-navy text-white shadow-xl md:scale-[1.03] z-10 ring-2 ring-navy"
                    : "bg-white border-gray-100 text-navy hover:border-saffron/30 hover:shadow-md hover:-translate-y-0.5"
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex flex-col h-full justify-between gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : COLOR_CLASSES[colorIdx]
                    }`}
                  >
                    <Icon
                      className="h-5 w-5 sm:h-5.5 sm:w-5.5"
                      strokeWidth={isActive ? 2.5 : 1.75}
                      aria-hidden
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold tracking-tight leading-snug">
                      {name}
                    </h3>
                    <p
                      className={`text-[10px] sm:text-xs font-medium mt-0.5 leading-snug transition-opacity ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <ShieldCheck className="h-4 w-4 text-saffron" aria-hidden />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Show More / View All */}
        <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!showAll && ALL_CATEGORIES.length > VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-navy transition-all hover:border-saffron hover:text-saffron hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Show All {ALL_CATEGORIES.length} Categories
            </button>
          )}
          <Link
            href={`/search${activeId !== "all" ? `?category=${activeId}` : ""}`}
            className="group inline-flex items-center gap-2 rounded-xl bg-navy px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-navy-dark active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            <span>{activeId !== "all" ? `Browse ${activeId} Services` : t("subtitle")}</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
