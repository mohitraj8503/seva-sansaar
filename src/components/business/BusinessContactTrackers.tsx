"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

function track(businessId: string, type: "whatsapp" | "call" | "view") {
  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, type }),
  });
}

export function BusinessViewBeacon({ businessId }: { businessId?: string }) {
  useEffect(() => {
    if (!businessId) return;
    track(businessId, "view");
  }, [businessId]);
  return null;
}

export function TrackedContactLinks({
  businessId,
  whatsapp,
  phone,
  category,
}: {
  businessId?: string;
  whatsapp: string;
  phone: string;
  category: string;
}) {
  const wa = whatsapp.replace(/\D/g, "");
  const tel = phone.replace(/\s+/g, "");

  return (
    <div className="mt-5 space-y-2">
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://wa.me/${wa}?text=${encodeURIComponent(
          `Namaste! Maine aapko Seva Sansaar pe dekha. Kya aap ${category} service ke liye available hain?`
        )}`}
        onClick={() => businessId && track(businessId, "whatsapp")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-india-green px-4 py-3 text-sm font-bold text-white"
      >
        <MessageCircle size={15} /> WhatsApp
      </a>
      <a
        href={`tel:${tel}`}
        onClick={() => businessId && track(businessId, "call")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white"
      >
        <Phone size={15} /> Call
      </a>
      <Link
        href="/search"
        className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700"
      >
        Get Directions
      </Link>
    </div>
  );
}
