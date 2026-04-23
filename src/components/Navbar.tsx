"use client";

import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react";
import { useEffect, useState, FormEvent } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Languages } from "lucide-react";
import { clsx } from "clsx";
import { DEFAULT_CITY } from "@/lib/constants";
import { sessionManager } from "@/lib/sessionManager";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navbar");

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "hi" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  useEffect(() => {
    const el = document.getElementById("seva-hero-top-sentinel");
    if (!el) {
      setScrolled(true);
      return;
    }
    setScrolled(false);
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const setRootFont = (px: number) => {
    document.documentElement.style.fontSize = `${px}px`;
  };

  const onHero = !scrolled;

  const goSearch = () => {
    const q = navQuery.trim();
    setDrawerOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push("/search");
  };

  const submitNavSearch = (e: FormEvent) => {
    e.preventDefault();
    goSearch();
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sessionManager.isSessionValid()) {
      router.push('/connectia');
    } else {
      router.push('/login');
    }
  };

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [drawerOpen]);

  const navLinkClass = onHero
    ? "text-sm font-semibold text-white drop-shadow-sm transition hover:text-white/90"
    : "text-sm font-semibold text-gray-500 transition hover:text-navy";

  const isConnectia = pathname?.includes("/connectia");
  if (isConnectia) return null;

  return (
    <header className="fixed top-0 z-[100] w-full">
      <div className="tricolor-stripe h-[3px] w-full shrink-0" aria-hidden />

      <div className={`text-white transition-colors duration-500 ${scrolled ? "bg-navy/95 backdrop-blur-sm" : "bg-transparent"}`}>
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-4 text-[10px] font-medium tracking-wider sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="opacity-80">🇮🇳 भारत सरकार</span>
            <span className="h-2 w-px bg-white/20" />
            <span className="opacity-80 uppercase">Government of India</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="transition hover:text-saffron"
                onClick={() => setRootFont(14)}
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                className="transition hover:text-saffron"
                onClick={() => setRootFont(16)}
                aria-label="Default font size"
              >
                A
              </button>
              <button
                type="button"
                className="transition hover:text-saffron"
                onClick={() => setRootFont(18)}
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-1.5 transition hover:text-saffron"
              aria-label={locale === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Languages size={12} strokeWidth={2.5} aria-hidden />
              <span>{locale === "en" ? "हिन्दी" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out border-b ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md border-gray-100 py-2 h-[75px]"
            : "bg-transparent border-transparent py-4 h-[100px]"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 rounded-lg focus-visible:outline-offset-4 active:scale-95 transition-transform">
            <div className={`relative transition-all duration-500 ${
              scrolled
                ? "h-10 w-[140px] sm:h-12 sm:w-[160px]"
                : "h-14 w-[180px] sm:h-20 sm:w-[240px]"
            }`}>
              <Image
                src="/logo-horizontal.png"
                alt="Seva Sansaar"
                fill
                className="object-contain object-left transition-all duration-500"
                sizes="(max-width: 640px) 160px, 240px"
                priority
              />
            </div>
          </Link>

          <div
            className={`mx-auto hidden min-w-0 max-w-lg flex-1 items-stretch rounded-full border transition-all duration-500 md:flex ${
              scrolled
                ? "border-gray-200 bg-gray-50/50"
                : "border-white/20 bg-white/10 backdrop-blur-md"
            }`}
            role="search"
            aria-label="Search services"
          >
            <Link
              href="/search"
              className={`flex shrink-0 items-center gap-1.5 border-r px-4 py-2 text-xs font-bold transition-all duration-500 ${
                scrolled ? "border-gray-200 text-navy" : "border-white/20 text-white"
              }`}
              aria-label={`Current location: ${DEFAULT_CITY}`}
            >
              <MapPin className={`h-3.5 w-3.5 ${scrolled ? "text-navy" : "text-white"}`} aria-hidden />
              <span>{DEFAULT_CITY}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
            </Link>
            <form onSubmit={submitNavSearch} className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search className={`h-4 w-4 shrink-0 transition-colors duration-500 ${scrolled ? "text-gray-400" : "text-white/70"}`} aria-hidden />
              <input
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                type="search"
                placeholder={scrolled ? "Search services..." : "I'm looking for..."}
                className={`min-w-0 flex-1 bg-transparent py-2 text-xs font-black uppercase tracking-widest focus:outline-none transition-all duration-500 ${
                   scrolled ? "text-navy placeholder:text-gray-400" : "text-white placeholder:text-white/50"
                }`}
                aria-label="Search for services"
              />
            </form>
          </div>

          <nav className="hidden shrink-0 items-center gap-8 lg:flex" aria-label="Main navigation">
            <Link href="/profile/bookings" className={navLinkClass}>
              {t("bookings")}
            </Link>
            <Link href="/list-business" className={navLinkClass}>
              {t("listBusiness")}
            </Link>
            <button
              onClick={handleLoginClick}
              className={`rounded-full px-8 py-3 text-xs font-black uppercase tracking-widest transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                onHero
                  ? "bg-white text-navy shadow-xl shadow-white/10"
                  : "bg-navy text-white hover:bg-navy-dark shadow-xl shadow-navy/10"
              }`}
            >
               {t("login")}
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0 lg:hidden">
            <button
              type="button"
              onClick={goSearch}
              className={`rounded-lg p-2 transition-colors duration-500 ${scrolled ? "text-navy" : "text-white drop-shadow-md"}`}
              aria-label="Search"
            >
              <Search size={22} aria-hidden />
            </button>
            <button
              type="button"
              className={`rounded-lg p-2 transition-colors duration-500 ${scrolled ? "text-navy" : "text-white drop-shadow-md"}`}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[110] bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-[120] flex w-[min(100%,20rem)] flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-bold text-navy">Menu</span>
              <button
                type="button"
                className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} aria-hidden />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 text-sm font-semibold text-navy">
              <Link href="/search" className="rounded-xl px-4 py-3 hover:bg-seva-offwhite" onClick={() => setDrawerOpen(false)}>
                Search Services
              </Link>
              <Link href="/profile/bookings" className="rounded-xl px-4 py-3 hover:bg-seva-offwhite" onClick={() => setDrawerOpen(false)}>
                {t("bookings")}
              </Link>
              <Link href="/list-business" className="rounded-xl px-4 py-3 hover:bg-seva-offwhite" onClick={() => setDrawerOpen(false)}>
                {t("listBusiness")}
              </Link>
              <button 
                onClick={(e) => { setDrawerOpen(false); handleLoginClick(e); }} 
                className="mt-4 rounded-full bg-navy px-4 py-3.5 text-center text-white shadow-lg shadow-navy/20 font-black uppercase tracking-widest text-[10px]"
              >
                {t("login")}
              </button>
            </nav>
            <div className="mt-auto border-t border-gray-200 p-4">
              <label htmlFor="drawer-search" className="text-xs font-bold uppercase tracking-wide text-gray-500">Quick search</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="drawer-search"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  type="search"
                  placeholder="Electrician near me…"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                  aria-label="Search services"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  onClick={goSearch}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
