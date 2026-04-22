"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Search } from "lucide-react";
import { getAdminHeaders } from "@/lib/adminFetch";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export default function AdminBookings() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bookings", { headers: await getAdminHeaders() });
    if (res.ok) {
      const data = (await res.json()) as { bookings: Booking[] };
      setRows(data.bookings);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((b) => {
      const blob = [
        b.id,
        b.userName,
        b.userPhone,
        b.service,
        b.businessName,
        b.date,
        b.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, filter]);

  const updateStatus = async (id: string | undefined, status: BookingStatus) => {
    if (!id) return;
    setUpdatingId(id);
    const h = await getAdminHeaders();
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) {
      setRows((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={20} /> Loading bookings…
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1a1f2e]">Booking management</h2>
          <p className="text-sm font-bold text-gray-400">
            Live Firestore data. Status changes use the admin API (Firebase ID token required).
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Filter by name, service, phone, id…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-[#f1f4f9] py-3 pl-12 pr-4 text-xs font-bold focus:border-[#ffca28] focus:bg-white focus:outline-none transition-all"
          />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Showing {filtered.length} of {rows.length}
        </p>
      </div>

      <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-[#f1f4f9] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 rounded-tl-2xl">ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Service &amp; provider</th>
                <th className="px-6 py-5">Date &amp; time</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right rounded-tr-2xl">Set status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#f1f4f9]/30 transition-colors group">
                  <td className="px-6 py-6 font-black text-[#1a1f2e]">{booking.id?.slice(0, 8)}…</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3 text-[#1a1f2e] font-black">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center text-[10px] text-orange-600">
                        {(booking.userName || "?").charAt(0)}
                      </div>
                      <div>
                        <p>{booking.userName}</p>
                        {booking.userPhone && (
                          <p className="text-[10px] font-bold text-gray-400">{booking.userPhone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-bold text-gray-600">
                    <div className="space-y-1">
                      <p className="font-black text-[#1a1f2e]">{booking.service}</p>
                      <p className="text-[10px] opacity-60 uppercase tracking-widest">{booking.businessName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <p className="font-black text-[#1a1f2e]">{booking.date}</p>
                      <p className="text-[10px] flex items-center gap-1 font-bold opacity-40 uppercase tracking-widest">
                        <Clock size={12} /> {booking.timeSlot}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      {updatingId === booking.id && (
                        <Loader2 className="animate-spin text-gray-400" size={16} />
                      )}
                      <select
                        aria-label="Update booking status"
                        className="max-w-[11rem] cursor-pointer rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-wider text-[#1a1f2e] shadow-sm focus:border-[#ffca28] focus:outline-none"
                        value={booking.status}
                        disabled={updatingId === booking.id || !booking.id}
                        onChange={(e) =>
                          void updateStatus(booking.id, e.target.value as BookingStatus)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">No bookings in Firestore yet.</p>
          )}
          {rows.length > 0 && filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">No rows match this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    {
      pending: "bg-amber-50 text-amber-700",
      confirmed: "bg-blue-50 text-blue-600",
      completed: "bg-green-50 text-green-600",
      cancelled: "bg-red-50 text-red-500",
    }[status] || "bg-gray-50 text-gray-600";

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${styles}`}>
      {status}
    </span>
  );
}
