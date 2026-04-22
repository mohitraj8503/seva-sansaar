"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone, RotateCcw, XCircle } from "lucide-react";
import { getStoredBookingIds } from "@/lib/customerBookingIds";
import type { Booking } from "@/lib/types";

export default function MyBookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [cancelFor, setCancelFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const ids = getStoredBookingIds();
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/bookings/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const data = (await res.json()) as { bookings: Booking[] };
      setRows(data.bookings.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: string) => {
    if (!phone.trim()) {
      alert("Enter the phone number used for the booking to cancel.");
      return;
    }
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", guestPhone: phone }),
    });
    if (res.ok) void load();
    else alert("Could not cancel. Check phone number.");
    setCancelFor(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={20} /> Loading your bookings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My bookings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bookings created on this device are listed below. Sign in with Firebase later for a full account history.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">No bookings yet. Book a service from a business page.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-navy">{b.businessName}</p>
                  <p className="text-sm text-gray-600">{b.service}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {b.date} · {b.timeSlot} · {b.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${b.userPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700"
                  >
                    <Phone size={14} /> Support
                  </a>
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <>
                      {cancelFor === b.id ? (
                        <span className="flex flex-wrap items-center gap-2">
                          <input
                            placeholder="Phone on booking"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="rounded border px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => b.id && cancel(b.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white"
                          >
            Confirm cancel
                          </button>
                          <button type="button" onClick={() => setCancelFor(null)} className="text-xs text-gray-500">
                            Back
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelFor(b.id!);
                            setPhone("");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1a2d5c] hover:underline"
                onClick={() => alert("Rebook: open the business page and book again.")}
              >
                <RotateCcw size={12} /> Rebook
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
