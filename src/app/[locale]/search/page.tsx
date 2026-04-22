"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Filter, Loader2, MapPin, Navigation, RefreshCw, Search, Sparkles, X, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { JAMSHEDPUR_REGION } from "@/lib/geo/jamshedpurRegion";
import { SearchResultsMap } from "@/lib/google-maps";
import { useTranslations } from "next-intl";
import type { NearbyProvidersResponse, ProviderSearchHit } from "@/lib/types/providerSearch";
import { SkeletonCard } from "@/components/SkeletonCard";

const categoryOptions = ["All", "Electrician", "Tutor", "Repair", "Salon"];
const ratingOptions = ["Any", "4.5+", "4.0+"];

export default function SearchPage() {
  const t = useTranslations("Search");
  const tc = useTranslations("Common");

  const [lat, setLat] = useState<number>(JAMSHEDPUR_REGION.center.lat);
  const [lng, setLng] = useState<number>(JAMSHEDPUR_REGION.center.lng);
  const [geoLabel, setGeoLabel] = useState<string>("Jamshedpur (default)");
  const [locLoading, setLocLoading] = useState(false);

  const [category, setCategory] = useState("All");
  const [rating, setRating] = useState("Any");
  const [distance, setDistance] = useState("Any");
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"nearest" | "recommended">("recommended");
  const [mapView, setMapView] = useState(false);

  const [payload, setPayload] = useState<NearbyProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radiusKm: "25",
        mode,
      });
      if (category !== "All") params.set("category", category);
      if (searchTerm) params.set("q", searchTerm);
      
      const res = await fetch(`/api/providers/nearby?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not load providers.");
      }
      const data = (await res.json()) as NearbyProvidersResponse;
      setPayload(data);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Could not load providers.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, category, mode, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNearby();
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [fetchNearby]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearchTerm(q);
  }, []);

  const filtered = useMemo(() => {
    let list = payload?.results ?? [];
    if (rating === "4.5+") list = list.filter((b) => b.rating >= 4.5);
    if (rating === "4.0+") list = list.filter((b) => b.rating >= 4.0);
    if (distance === "< 2 km") list = list.filter((b) => b.distanceKm < 2);
    if (distance === "< 5 km") list = list.filter((b) => b.distanceKm < 5);
    return list;
  }, [payload, rating, distance]);

  const clearFilters = () => {
    setCategory("All");
    setRating("Any");
    setDistance("Any");
    setSearchTerm("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLabel("Your location");
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setError("Location permission denied. Using Jamshedpur city centre.");
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const mapData = useMemo(() => {
    return filtered.map((f) => ({
      lat: f.lat,
      lng: f.lng,
      address: f.name,
      placeId: f.slug,
    }));
  }, [filtered]);

  return (
    <main className="min-h-screen bg-[#FDFCFB] pb-24 pt-20">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[#1a2d5c] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-xl text-lg font-medium text-gray-500">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={tc("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm font-semibold shadow-sm transition-all focus:border-navy focus:ring-4 focus:ring-navy/5"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setMapView(!mapView)}
              className="group flex items-center gap-2 whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              <MapPin size={18} className="text-navy transition-transform group-hover:scale-110" />
              {mapView ? t("listView") : t("mapView")}
            </button>
          </div>
        </div>

        {/* Filters & Location Bar */}
        <div className="sticky top-4 z-40 mb-10 flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white/95 p-4 md:p-6 shadow-xl shadow-gray-200/40 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2">
              <MapPin className="text-navy" size={16} />
              <div className="text-xs">
                <span className="block font-bold text-gray-900">{geoLabel}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{lat.toFixed(3)}, {lng.toFixed(3)}</span>
              </div>
              <button 
                onClick={useMyLocation}
                disabled={locLoading}
                aria-label="Use my current location"
                className="ml-2 rounded-lg bg-navy/5 p-1.5 text-navy transition-colors hover:bg-navy/10 disabled:opacity-50"
              >
                {locLoading ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
              </button>
            </div>

            <div className="h-8 w-px bg-gray-100 hidden lg:block" />

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Filter size={12} /> {t("filters")}
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-transparent bg-gray-50 px-3 py-2 text-xs font-bold text-navy outline-none transition-all hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-navy/5"
              >
                {categoryOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                aria-label="Filter by rating"
                className="rounded-xl border border-transparent bg-gray-50 px-3 py-2 text-xs font-bold text-navy outline-none transition-all hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-navy/5"
              >
                {ratingOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              {(category !== "All" || rating !== "Any" || searchTerm) && (
                 <button 
                  onClick={clearFilters} 
                  className="text-[10px] font-black uppercase tracking-wider text-[#FF9933] hover:text-[#e68a2e] px-2 py-1"
                  aria-label="Clear all filters"
                 >
                   Clear all
                 </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <span className="mr-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t("ranking")}</span>
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setMode("nearest")}
                aria-label="Sort by nearest location"
                className={`rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  mode === "nearest" ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("nearest")}
              </button>
              <button
                onClick={() => setMode("recommended")}
                aria-label="Sort by recommended"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  mode === "recommended" ? "bg-[#FFC107] text-[#1a2d5c] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Sparkles size={12} /> {t("recommended")}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-6 text-red-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X size={24} className="text-red-600" />
              </div>
              <div>
                <p className="font-black">Oops! Something went wrong.</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => void fetchNearby()}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : mapView ? (
            <div className="h-[70vh] w-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-2 shadow-2xl">
              <SearchResultsMap center={{ lat, lng }} results={mapData} className="h-full w-full rounded-[2rem]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {filtered.map((business, index) => (
                <SearchCard 
                  key={`${business.source}-${business.slug}`} 
                  business={business} 
                  mode={mode} 
                  tc={tc}
                  rank={index + 1}
                  priority={index < 2}
                />
              ))}
              
              {filtered.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                    <MapPin size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{t("noResults")}</h3>
                  <p className="mt-2 max-w-sm text-lg font-medium text-gray-500">
                    Try adjusting your filters, widening the search radius, or moving the map marker.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="mt-8 rounded-2xl bg-navy px-8 py-4 text-sm font-bold text-white shadow-xl shadow-navy/20 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SearchCard({ 
  business, 
  mode, 
  tc, 
  rank,
  priority = false 
}: { 
  business: ProviderSearchHit; 
  mode: "nearest" | "recommended"; 
  tc: (k: string) => string; 
  rank: number;
  priority?: boolean;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 md:flex-row">
      <div className="relative h-56 w-full overflow-hidden md:h-auto md:w-[300px]">
        <Image
          src={business.image || "/images/placeholder-service.jpg"}
          alt={`${business.name} - ${business.category} in ${business.locality}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 300px"
          priority={priority}
          quality={80}
        />
        <div className="absolute left-4 top-4">
           <VerificationBadge verified={business.verified} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-navy">{business.name}</h2>
              {mode === "recommended" && rank === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                  <TrendingUp size={10} /> Best Match
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <span className="uppercase tracking-widest text-[#FF9933]">{business.category}</span>
              <span className="h-1 w-1 rounded-full bg-gray-200" />
              <span>{business.locality}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
            <span>★</span> {business.rating}
          </div>
        </div>

        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-400 font-medium">
          {business.description}
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <div className="flex items-center gap-1.5">
              <Navigation size={12} className="text-navy/40" /> {business.distanceKm} km away
           </div>
           <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#FF9933]" /> {business.reviews} reviews
           </div>
           <div className="flex items-center gap-1.5 text-emerald-600">
              <RefreshCw size={12} /> {(business.completionRate * 100).toFixed(0)}% success
           </div>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Link 
            href={`/business/${business.slug}`}
            className="flex-1 text-center rounded-xl bg-navy py-3.5 text-xs font-bold text-white transition-all hover:bg-[#132246] hover:shadow-lg active:scale-95"
            aria-label={`Book ${business.name} now`}
          >
            Book Now
          </Link>
          <Link 
            href={`/business/${business.slug}`}
            className="flex-1 text-center rounded-xl border border-gray-200 bg-white py-3.5 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
            aria-label={`View details of ${business.name}`}
          >
            {tc("viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}


