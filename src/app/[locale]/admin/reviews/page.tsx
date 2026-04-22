"use client";

import { useEffect, useState } from "react";
import { EyeOff, Flag, Loader2 } from "lucide-react";
import { getAdminHeaders } from "@/lib/adminFetch";
import type { Review } from "@/lib/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews", { headers: await getAdminHeaders() });
    if (res.ok) {
      const data = (await res.json()) as { reviews: Review[] };
      setReviews(data.reviews);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const moderate = async (reviewId: string, hidden: boolean, flagged: boolean) => {
    const h = await getAdminHeaders();
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ reviewId, hidden, flagged }),
    });
    if (res.ok) void load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={20} /> Loading reviews…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-[#1a1f2e]">Review moderation</h2>
        <p className="mt-1 text-sm text-gray-500">Hide inappropriate reviews or flag for audit (C8).</p>
      </div>

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">{r.displayName}</p>
                <p className="text-xs text-gray-500">{r.businessId}</p>
                <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                <p className="mt-1 text-xs text-saffron">★ {r.rating}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.flagged && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                    Flagged
                  </span>
                )}
                {r.hidden && (
                  <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700">Hidden</span>
                )}
                <button
                  type="button"
                  onClick={() => r.id && void moderate(r.id, !r.hidden, !!r.flagged)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold"
                >
                  <EyeOff size={14} /> {r.hidden ? "Show" : "Hide"}
                </button>
                <button
                  type="button"
                  onClick={() => r.id && void moderate(r.id, !!r.hidden, !r.flagged)}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900"
                >
                  <Flag size={14} /> Toggle flag
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews in Firestore.</p>}
    </div>
  );
}
