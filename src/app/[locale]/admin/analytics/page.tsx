"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Loader2 } from "lucide-react";
import { getAdminHeaders } from "../../../../lib/adminFetch";

type AdminStats = {
  bookingsTotal: number;
  bookingsToday: number;
  revenueEstimate: number;
  providersActive: number;
  providersPending: number;
  series: { label: string; bookings: number }[];
  completionRatePct?: number;
  categoryBreakdown?: { name: string; count: number; pct: number }[];
  note?: string;
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const h = await getAdminHeaders();
        const res = await fetch("/api/admin/stats", { headers: h });
        if (res.ok) setStats(await res.json());
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthBars = useMemo(() => {
    const s = stats?.series ?? [];
    return s.slice(-12);
  }, [stats?.series]);

  const maxBar = Math.max(1, ...monthBars.map((x) => x.bookings));

  const exportJson = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seva-sansaar-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rev = stats ? `₹${stats.revenueEstimate.toLocaleString("en-IN")}` : "—";
  const completion = stats?.completionRatePct;
  const retention =
    stats && stats.providersActive + stats.providersPending > 0
      ? Math.round(
          (stats.providersActive / (stats.providersActive + stats.providersPending)) * 1000
        ) / 10
      : null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={20} /> Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1a1f2e]">Platform analytics</h2>
          <p className="text-sm font-bold text-gray-400">Sourced from /api/admin/stats (Firestore).</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => exportJson()}
            disabled={!stats}
            className="flex items-center gap-2 rounded-2xl bg-[#1a1f2e] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50"
          >
            <Download size={16} /> Export JSON
          </button>
        </div>
      </div>

      {stats?.note && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
          {stats.note}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <AnalyticsCard
          label="Estimated revenue"
          value={rev}
          sub="Sum of estimatedAmount on non-cancelled bookings"
        />
        <AnalyticsCard
          label="Booking completion"
          value={completion !== undefined ? `${completion}%` : "—"}
          sub="Completed ÷ all bookings"
          trend={completion !== undefined && completion >= 50 ? "up" : "down"}
          change={
            completion !== undefined
              ? completion >= 50
                ? "Healthy"
                : "Review flows"
              : undefined
          }
        />
        <AnalyticsCard
          label="Provider share (active vs pending)"
          value={retention !== null ? `${retention}%` : "—"}
          sub="Active verified vs active+pending"
          trend={retention !== null && retention >= 60 ? "up" : "down"}
          change={retention !== null ? `${stats?.providersActive ?? 0} active` : undefined}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50">
          <div className="mb-10 flex items-center justify-between border-l-4 border-blue-500 pl-4">
            <div>
              <h3 className="text-lg font-black text-[#1a1f2e]">Booking activity</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Last {monthBars.length} days with data (up to 30)
              </p>
            </div>
          </div>

          <div className="flex h-64 items-end gap-2 px-1">
            {(monthBars.length ? monthBars : [{ label: "-", bookings: 0 }]).map((s, i) => {
              const h = (s.bookings / maxBar) * 100;
              return (
                <div key={`${s.label}-${i}`} className="group relative flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-[#f1f4f9] transition-all group-hover:bg-blue-600"
                    style={{ height: `${Math.max(6, h)}%`, minHeight: "8px" }}
                  />
                  <span className="max-w-full truncate text-[9px] font-black uppercase text-gray-300">
                    {s.label.length >= 8 ? s.label.slice(8) : s.label}
                  </span>
                  <div className="absolute -top-9 z-20 scale-0 rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-black text-white shadow-xl transition-transform group-hover:scale-100">
                    {s.bookings} bookings
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50">
          <div className="mb-10 flex items-center border-l-4 border-purple-500 pl-4">
            <div>
              <h3 className="text-lg font-black text-[#1a1f2e]">Verified providers by category</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Share of active listings
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {(stats?.categoryBreakdown?.length ? stats.categoryBreakdown : [{ name: "—", pct: 0 }]).map(
              (row) => (
                <ProgressBar key={row.name} label={row.name} value={row.pct} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  sub,
  trend,
  change,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down";
  change?: string;
}) {
  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{label}</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <h3 className="text-3xl font-black text-[#1a1f2e]">{value}</h3>
        {change !== undefined && trend && (
          <div
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black ${
              trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        )}
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{sub}</p>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-gray-500">{label}</span>
        <span className="text-[#1a1f2e]">{value}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#f1f4f9]">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-1000"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
