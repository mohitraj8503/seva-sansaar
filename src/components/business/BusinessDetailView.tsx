"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { VerificationBadge } from "@/components/VerificationBadge";
import { BusinessBookingPanel } from "@/components/booking/BusinessBookingPanel";
import { useTranslations } from "next-intl";

interface BusinessDetailViewProps {
  business: {
    id: string;
    slug: string;
    name: string;
    category: string;
    locality: string;
    city: string;
    description: string;
    image: string;
    services: string[];
    serviceAreas: string[];
    hours: string;
    priceRange: string;
    rating?: number;
    reviews?: number;
    verified: boolean;
    vishwakarma?: boolean;
    status?: string;
    whatsapp: string;
    phone: string;
  };
}

type PackageItem = {
  name: string;
  description: string;
  price: number;
  popular?: boolean;
};

const packages: PackageItem[] = [
  {
    name: "Basic",
    description: "Standard service for simple requirements",
    price: 499,
  },
  {
    name: "Standard",
    description: "Complete service with priority assistance",
    price: 899,
    popular: true,
  },
  {
    name: "Premium",
    description: "Priority service with end-to-end support",
    price: 1499,
  },
];

const portfolioImages = [
  "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/6474474/pexels-photo-6474474.jpeg?auto=compress&cs=tinysrgb&w=900",
];

export function BusinessDetailView({
  business,
}: BusinessDetailViewProps) {
  const t = useTranslations("Detail");
  const tc = useTranslations("Common");

  const [selectedPackage, setSelectedPackage] = useState<PackageItem>(
    packages[1]
  );

  const [portfolioIndex, setPortfolioIndex] = useState(0);

  const trackLeadClick = (type: "whatsapp" | "call") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("seva:lead-click", {
          detail: {
            businessId: business.id,
            businessSlug: business.slug,
            businessName: business.name,
            type,
            timestamp: new Date().toISOString(),
          },
        })
      );

      console.info("Seva Sansaar lead click:", {
        businessId: business.id,
        type,
      });
    }
  };

  const openWhatsApp = () => {
    trackLeadClick("whatsapp");

    if (!business.whatsapp) {
      alert("WhatsApp number is not available for this artisan.");
      return;
    }

    const cleanNumber = business.whatsapp.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hello ${business.name}, I found your profile on Seva Sansaar. I am interested in your ${selectedPackage.name} package (₹${selectedPackage.price}).`
    );

    window.open(
      `https://wa.me/${cleanNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const makeCall = () => {
    trackLeadClick("call");

    if (!business.phone) {
      alert("Phone number is not available for this artisan.");
      return;
    }

    window.location.href = `tel:${business.phone}`;
  };

  const nextPortfolio = () => {
    setPortfolioIndex(
      (current) => (current + 1) % portfolioImages.length
    );
  };

  const previousPortfolio = () => {
    setPortfolioIndex(
      (current) =>
        (current - 1 + portfolioImages.length) %
        portfolioImages.length
    );
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl">
      {/* HERO / COVER */}
      <section className="relative">
        <div className="relative h-[280px] w-full sm:h-[360px]">
          <Image
            src={business.image}
            alt={business.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-white sm:left-8 sm:right-8">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                Seva Sansaar Professional
              </p>

              <h1 className="text-3xl font-black sm:text-5xl">
                {business.name}
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/90">
                {business.category}
              </p>
            </div>

            {business.verified && (
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-lg">
                <BadgeCheck size={18} />
                Verified Artisan
              </div>
            )}
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="grid grid-cols-2 divide-x border-b border-gray-100 bg-white sm:grid-cols-4">
          <div className="p-4 text-center">
            <div className="mx-auto mb-1 flex justify-center text-yellow-500">
              <Star size={19} fill="currentColor" />
            </div>
            <p className="text-lg font-black text-gray-900">
              {business.rating ?? "4.8"}
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Rating
            </p>
          </div>

          <div className="p-4 text-center">
            <div className="mx-auto mb-1 flex justify-center text-blue-600">
              <Users size={19} />
            </div>
            <p className="text-lg font-black text-gray-900">
              {business.reviews ?? "100+"}
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Reviews
            </p>
          </div>

          <div className="p-4 text-center">
            <div className="mx-auto mb-1 flex justify-center text-green-600">
              <ShieldCheck size={19} />
            </div>
            <p className="text-lg font-black text-gray-900">
              Trusted
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Provider
            </p>
          </div>

          <div className="p-4 text-center">
            <div className="mx-auto mb-1 flex justify-center text-indigo-600">
              <CalendarCheck size={19} />
            </div>
            <p className="text-lg font-black text-gray-900">
              Local
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Professional
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_360px]">
        {/* MAIN CONTENT */}
        <section>
          {/* BADGES */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <VerificationBadge verified={business.verified} />

            {business.vishwakarma && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {tc("vishwakarma")}
              </span>
            )}

            {business.status === "pending" && (
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                {t("approvalPending")}
              </span>
            )}
          </div>

          {/* LOCATION */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} />
              {business.locality}, {business.city}
            </span>

            <span className="text-gray-300">•</span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={16} />
              {business.hours || t("contactAvailability")}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <h2 className="text-2xl font-black text-gray-950">
              About this artisan
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              {business.description ||
                t("professionalProvider")}
            </p>
          </div>

          {/* PORTFOLIO */}
          <section className="mt-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  Work showcase
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Recent work
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={previousPortfolio}
                  className="rounded-full border border-gray-200 px-3 py-2 text-sm font-bold hover:bg-gray-50"
                  aria-label="Previous portfolio image"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextPortfolio}
                  className="rounded-full border border-gray-200 px-3 py-2 text-sm font-bold hover:bg-gray-50"
                  aria-label="Next portfolio image"
                >
                  →
                </button>
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl">
              <Image
                src={portfolioImages[portfolioIndex]}
                alt={`${business.name} work sample`}
                width={900}
                height={600}
                className="h-[280px] w-full object-cover sm:h-[360px]"
                unoptimized
              />

              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                {portfolioIndex + 1} / {portfolioImages.length}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {portfolioImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPortfolioIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    portfolioIndex === index
                      ? "w-10 bg-blue-600"
                      : "w-5 bg-gray-200"
                  }`}
                  aria-label={`View portfolio ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* SERVICES */}
          <section className="mt-10">
            <h2 className="text-2xl font-black text-gray-950">
              Services offered
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {business.services.length > 0 ? (
                business.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-green-600"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      {service}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-gray-600">
                  {business.category}
                </div>
              )}
            </div>
          </section>

          {/* SERVICE AREAS */}
          <section className="mt-10">
            <h2 className="text-2xl font-black text-gray-950">
              Service areas
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {business.serviceAreas.length > 0
                ? business.serviceAreas.join(" • ")
                : `${business.locality}, ${business.city}`}
            </p>
          </section>

          {/* REVIEWS */}
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-600">
                  Customer feedback
                </p>

                <h2 className="mt-1 text-2xl font-black text-gray-950">
                  Reviews
                </h2>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-2 text-sm font-black text-yellow-700">
                <Star size={16} fill="currentColor" />
                {business.rating ?? "4.8"}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((idx) => (
                <article
                  key={idx}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-gray-900">
                      Verified customer {idx}
                    </p>

                    <span className="text-xs font-semibold text-gray-400">
                      2026
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-yellow-500">
                    ★★★★★
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Professional service, clear communication and
                    good overall experience.
                  </p>
                </article>
              ))}
            </div>
          </section>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          {/* RATE CARD */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-lg sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Interactive rate card
            </p>

            <h2 className="mt-2 text-2xl font-black text-gray-950">
              Choose your package
            </h2>

            <div className="mt-5 space-y-3">
              {packages.map((pkg) => {
                const selected = selectedPackage.name === pkg.name;

                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                        Popular
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3 pr-16">
                      <span className="font-black text-gray-950">
                        {pkg.name}
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={19}
                          className="text-blue-600"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {pkg.description}
                    </p>

                    <p className="mt-3 text-xl font-black text-gray-950">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* LIVE QUOTE */}
            <div className="mt-5 rounded-2xl bg-gray-950 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Instant quote
              </p>

              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300">
                    {selectedPackage.name} package
                  </p>

                  <p className="text-3xl font-black">
                    ₹{selectedPackage.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <CheckCircle2
                  size={28}
                  className="text-green-400"
                />
              </div>
            </div>

            <div className="mt-5">
              <BusinessBookingPanel
                businessId={business.id}
                businessName={business.name}
                services={
                  business.services.length
                    ? business.services
                    : [business.category]
                }
              />
            </div>
          </div>

          {/* DIRECT LEAD ACTIONS */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              Talk to artisan
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={makeCall}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                <Phone size={18} />
                Call
              </button>
            </div>
          </div>

          {/* GUARANTEE */}
          <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" />

              <h4 className="text-sm font-black text-blue-950">
                Seva Sansaar Guarantee
              </h4>
            </div>

            <p className="mt-2 text-xs font-semibold leading-5 text-blue-900/70">
              Secure booking, transparent pricing and trusted
              service professionals through Seva Sansaar.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}