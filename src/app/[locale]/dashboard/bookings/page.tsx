"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";
import type { BookingRecord } from "@/lib/types/owner";

export default function OwnerBookingsPage() {
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const s = readOwnerSession();
    if (!s) return;
    const res = await fetch("/api/owner/bookings", { headers: { ...ownerAuthHeader() } });
    if (res.ok) {
      const data = (await res.json()) as { bookings: BookingRecord[] };
      setRows(data.bookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const upcoming = useMemo(
    () => rows.filter((b) => new Date(b.scheduledAt) >= new Date() && b.status !== "cancelled" && b.status !== "completed"),
    [rows]
  );
  const past = useMemo(() => rows.filter((b) => !upcoming.includes(b)), [rows, upcoming]);

  const setStatus = async (id: string, status: BookingRecord["status"]) => {
    const res = await fetch(`/api/owner/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerAuthHeader() },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void load();
  };

  if (loading) return <p className="text-sm text-gray-600">Loading bookings…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">Upcoming and past customer requests.</p>
      </div>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Upcoming</h2>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 && <p className="text-sm text-gray-500">No upcoming bookings.</p>}
          {upcoming.map((b) => (
            <article key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-bold text-gray-900">{b.customerName}</p>
                <p className="text-sm text-gray-600">{b.serviceLabel}</p>
                <p className="text-xs text-gray-500">{new Date(b.scheduledAt).toLocaleString("en-IN")}</p>
                <p className="mt-1 text-xs font-semibold capitalize text-[#1a2d5c]">{b.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => void setStatus(b.id, "confirmed")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => void setStatus(b.id, "cancelled")}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => void setStatus(b.id, "completed")}
                    className="rounded-lg bg-[#1a2d5c] px-3 py-2 text-xs font-bold text-white"
                  >
                    Mark complete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">Past</h2>
        <div className="mt-3 space-y-3">
          {past.length === 0 && <p className="text-sm text-gray-500">No past bookings yet.</p>}
          {past.map((b) => (
            <article key={b.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="font-bold text-gray-900">{b.customerName}</p>
              <p className="text-sm text-gray-600">{b.serviceLabel}</p>
              <p className="text-xs text-gray-500">{new Date(b.scheduledAt).toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs font-semibold capitalize text-gray-600">{b.status}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
