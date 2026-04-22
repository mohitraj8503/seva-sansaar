"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { ArrowRight, ChevronDown, MapPin, Search } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

const heroDelay = (ms: number): CSSProperties =>
  ({ ["--hero-delay" as string]: `${ms}ms` }) as CSSProperties;

const PIXABAY_PRIMARY = "https://cdn.pixabay.com/video/2023/08/13/175815-854238855_large.mp4";
/** CDN fallbacks if the Pixabay download URL is blocked; includes known-working sibling id. */
const VIDEO_FALLBACKS = [
  "https://cdn.pixabay.com/video/2023/08/13/175815-854238855_medium.mp4",
  "https://cdn.pixabay.com/video/2023/08/13/175815-854238855_small.mp4",
] as const;

const HERO_POSTER =
  "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80";

export default function Hero() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [heroQuery, setHeroQuery] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const v = videoRef.current;
    if (!v || videoFailed) return;

    const tryPlay = () => {
      if (mq.matches) {
        v.pause();
        v.removeAttribute("autoplay");
        return;
      }
      void v.play().catch(() => {});
    };

    tryPlay();
    mq.addEventListener("change", tryPlay);
    v.setAttribute("fetchpriority", "high");

    const onCanPlay = () => tryPlay();
    v.addEventListener("canplay", onCanPlay);

    return () => {
      mq.removeEventListener("change", tryPlay);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [videoFailed]);

  const onHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = heroQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push("/search");
  };

  return (
    <section
      className="relative isolate min-h-[100svh] min-h-[100vh] w-full overflow-hidden bg-[#0a1428]"
      aria-labelledby="hero-heading"
    >
      <div id="seva-hero-top-sentinel" className="pointer-events-none absolute left-0 right-0 top-0 z-[5] h-1" aria-hidden />

      {/* Optimized Background Image (LCP Candidate) */}
      <div className="absolute inset-0 z-0 overflow-hidden" role="presentation">
        <Image
          src={HERO_POSTER}
          alt="Aerial view of Jamshedpur City"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={85}
          fetchPriority="high"
        />
      </div>

      {/* Video - Desktop Only for Performance */}
      {!videoFailed && (
        <div className="hidden md:block absolute inset-0 z-[1] h-full w-full">
          <video
            ref={videoRef}
            src={PIXABAY_PRIMARY}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            style={{ width: "100%", height: "100%", minHeight: "100svh" }}
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          >
            {VIDEO_FALLBACKS.map((src) => (
              <source key={src} src={src} type="video/mp4" />
            ))}
          </video>
        </div>
      )}

      <noscript>
        <div className="absolute inset-0 z-[1]">
          <Image src={HERO_POSTER} alt="Seva Sansaar Hero" fill className="object-cover" priority />
        </div>
      </noscript>

      <div className="absolute inset-0 z-[2] bg-[rgba(10,20,50,0.62)]" aria-hidden />

      <div className="relative z-10 flex min-h-[100svh] min-h-[100vh] flex-col justify-center pt-[124px] pb-40 sm:pb-44">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div
              className="hero-fade-in inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur-md border border-white/10"
              style={heroDelay(0)}
            >
              Bharat&apos;s Digital Service Infrastructure
            </div>
 
            <h1
              id="hero-heading"
              className="hero-fade-in mt-8 font-light leading-[1.1] text-white"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                ...heroDelay(50),
              }}
            >
              <span className="block font-bold">Professional services.</span>
              <span className="block opacity-90">At your doorstep.</span>
            </h1>
 
            <p
              className="hero-fade-in mt-8 max-w-[500px] text-base font-medium leading-relaxed text-white/60 sm:text-lg"
              style={heroDelay(100)}
            >
              The most trusted platform for verified local experts. Zero commission, direct booking, and guaranteed quality.
            </p>
 
            <div className="hero-fade-in mt-12 flex flex-wrap gap-5" style={heroDelay(150)}>
              <Link
                href="/search"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-[#FF9933] px-10 text-sm font-bold text-[#1a2d5c] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,153,51,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-2">Explore Services <ArrowRight size={16} /></span>
              </Link>
              <Link
                href="/list-business"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#1a2d5c] px-10 text-sm font-bold text-white transition-all duration-300 hover:bg-[#132246]"
              >
                Join as Professional
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-white/70">
              <span className="flex items-center gap-1.5 font-bold">✓ Background Verified</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span className="flex items-center gap-1.5 font-bold">✓ Transparent Pricing</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span className="flex items-center gap-1.5 font-bold">✓ Zero Commission</span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span className="flex items-center gap-1.5 font-bold text-[#FF9933]">⭐ 4.8+ Rated</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-20 px-4 sm:bottom-10">
          <form
            onSubmit={onHeroSearch}
            className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/20 sm:p-3"
            role="search"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
              <div className="flex min-h-[64px] flex-1 items-center gap-4 rounded-2xl bg-white/5 px-4 transition hover:bg-white/10">
                <MapPin className="shrink-0 text-[#FF9933]" size={20} />
                <div className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Location</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">Jamshedpur</span>
                    <ChevronDown size={14} className="shrink-0 text-white/40" />
                  </div>
                </div>
              </div>

              <div className="flex min-h-[64px] min-w-0 flex-[2] items-center gap-4 rounded-2xl bg-white px-6 shadow-inner">
                <Search className="shrink-0 text-gray-400" size={20} aria-hidden="true" />
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Which service are you looking for?"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  aria-label="Search for services"
                />
              </div>

              <button
                type="submit"
                className="flex h-[64px] w-full min-w-[140px] items-center justify-center rounded-2xl bg-[#FF9933] px-8 text-sm font-bold text-[#1a2d5c] shadow-lg shadow-[#FF9933]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 md:w-auto"
              >
                Find Experts
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
