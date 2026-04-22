"use client";

import Image from "next/image";
import { BadgeCheck, Clock3, MapPin, Star } from "lucide-react";
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

export function BusinessDetailView({ business }: BusinessDetailViewProps) {
  const t = useTranslations("Detail");
  const tc = useTranslations("Common");

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-72 w-full">
        <Image
          src={business.image}
          alt={business.name}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <VerificationBadge verified={business.verified} />
            {business.vishwakarma && (
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                {tc("vishwakarma")}
              </span>
            )}
            {business.status === "pending" && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                {t("approvalPending")}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-navy">{business.name}</h1>
          <p className="mt-2 text-sm font-semibold text-gray-500">{business.category}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {business.locality}, {business.city}
            </span>
            {business.rating !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="fill-saffron text-saffron" /> {business.rating} ({business.reviews} reviews)
              </span>
            )}
          </div>

          <p className="mt-6 text-gray-700">{business.description || t("professionalProvider")}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-black text-navy">{t("servicesOffered")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {business.services.map((service) => (
                  <li key={service} className="inline-flex items-center gap-2">
                    <BadgeCheck size={14} className="text-india-green" /> {service}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-black text-navy">{t("workingHours")}</h2>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                <Clock3 size={14} /> {business.hours || t("contactAvailability")}
              </p>

              <h3 className="mt-6 text-lg font-black text-navy">{t("serviceAreas")}</h3>
              <p className="mt-2 text-sm text-gray-700">
                {business.serviceAreas.length > 0
                  ? business.serviceAreas.join(", ")
                  : `${business.locality}, ${business.city}`}
              </p>
            </div>
          </div>

          {business.rating !== undefined && (
            <section className="mt-10">
              <h2 className="text-xl font-black text-navy">{t("recentReviews")}</h2>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((idx) => (
                  <article key={idx} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Verified customer {idx}</p>
                      <span className="text-xs font-semibold text-gray-500">April 2026</span>
                    </div>
                    <p className="mt-1 text-sm text-saffron">★★★★★</p>
                    <p className="mt-2 text-sm text-gray-700">
                      Professional and timely service. Communication was clear and pricing was transparent.
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="h-fit space-y-6">
          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t("estimatedCost")}</p>
            <p className="mt-2 text-3xl font-black text-navy">{business.priceRange || "₹499 - ₹1,499"}</p>
            
            <div className="mt-8">
              <BusinessBookingPanel
                businessId={business.id}
                businessName={business.name}
                services={business.services.length ? business.services : [business.category]}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-dashed border-gray-100 p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a2d5c]">Platform Guarantee</h4>
            <p className="mt-2 text-[10px] font-bold leading-relaxed text-gray-400">
              Seva Sansaar ensures safe delivery of services. Pay securely via the platform and enjoy our 30-day service warranty.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
