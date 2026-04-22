"use client";

import { 
  Users, 
  Store, 
  CheckCircle, 
  TrendingUp,
  Download,
  Plus,
  ArrowUpRight
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getAdminHeaders } from "@/lib/adminFetch";

type AdminStats = {
  bookingsTotal: number;
  bookingsToday: number;
  revenueEstimate: number;
  providersActive: number;
  providersPending: number;
  series: { label: string; bookings: number }[];
  note?: string;
  completionRatePct?: number;
  categoryBreakdown?: { name: string; count: number; pct: number }[];
};

function NumberTicker({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  
  // Extract number and formatting
  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[0-9]*([^0-9]*)$/)?.[1] || "";
  const hasComma = value.includes(",");

  useEffect(() => {
    const end = numericValue;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out expo
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOutExpo * end);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  const formattedCount = hasComma ? count.toLocaleString() : count;

  return <span>{prefix}{formattedCount}{suffix}</span>;
}

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminDashboard() {
  const locale = useLocale();
  const [viewType, setViewType] = useState<"WEEK" | "MONTH">("MONTH");
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const headers = await getAdminHeaders();
        const res = await fetch("/api/admin/stats", { headers });
        if (res.ok) setStats(await res.json());
      } catch {
        setStats(null);
      }
    })();
  }, []);

  const rev = stats ? `₹${stats.revenueEstimate.toLocaleString("en-IN")}` : "—";
  const prov = stats ? String(stats.providersActive) : "—";
  const book = stats ? String(stats.bookingsToday) : "—";
  const pend = stats ? String(stats.providersPending) : "—";
  const completion =
    stats?.completionRatePct !== undefined ? `${stats.completionRatePct}%` : "—";

  const rawSeries = useMemo(() => stats?.series ?? [], [stats?.series]);
  const chartSeries = useMemo(() => {
    if (viewType === "WEEK") return rawSeries.slice(-7);
    return rawSeries.slice(-30);
  }, [rawSeries, viewType]);

  const maxBook = Math.max(1, ...chartSeries.map((s) => s.bookings));

  const weekEngagement = useMemo(() => rawSeries.slice(-7), [rawSeries]);
  const maxWeek = Math.max(1, ...weekEngagement.map((s) => s.bookings));

  const exportSnapshot = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seva-sansaar-admin-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Top Welcome Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#1a1f2e]">
            Welcome back, <span className="text-[#ffca28]">Admin</span>
          </h2>
          <p className="mt-2 text-sm font-bold text-gray-400">
            Here&apos;s a quick overview of your Institution&apos;s performance today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportSnapshot()}
            disabled={!stats}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download size={14} /> EXPORT
          </button>
          <Link
            href={`/${locale}/list-business`}
            className="flex items-center gap-2 rounded-2xl bg-[#ffca28] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#1a1f2e] shadow-[0_8px_16px_rgba(255,202,40,0.3)] transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_12px_24px_rgba(255,202,40,0.4)] active:scale-95"
          >
            <Plus size={16} /> ADD SERVICE
          </Link>
        </div>
      </div>

      {stats?.note && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
          {stats.note}
        </p>
      )}

      {/* Modern Stats Grid - live from /api/admin/stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (est.)" value={rev} change="Live" icon={<div className="text-gray-400 group-hover:text-[#ffca28] transition-colors"><TrendingUp size={24} /></div>} />
        <StatCard label="Active providers" value={prov} change={`Pending: ${pend}`} icon={<div className="text-gray-400 group-hover:text-[#ffca28] transition-colors"><Users size={24} /></div>} />
        <StatCard label="Bookings today" value={book} change={`Total: ${stats?.bookingsTotal ?? "—"}`} icon={<div className="text-gray-400 group-hover:text-[#ffca28] transition-colors"><Store size={24} /></div>} />
        <StatCard
          label="Completion rate"
          value={completion}
          change={stats ? `Total: ${stats.bookingsTotal}` : "—"}
          icon={<div className="text-gray-400 group-hover:text-[#ffca28] transition-colors"><CheckCircle size={24} /></div>}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Revenue Chart Section */}
        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-black text-[#1a1f2e]">Booking volume</h3>
              <p className="text-xs font-bold text-gray-400">New bookings per day (createdAt).</p>
            </div>
            <div className="relative flex p-1 rounded-xl bg-gray-50 h-[38px] w-[172px]">
              {/* Sliding Background */}
              <div 
                className="absolute inset-y-1 h-[30px] w-[82px] rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out"
                style={{
                  transform: `translateX(${viewType === "WEEK" ? "0" : "84px"})`
                }}
              />
              <button 
                onClick={() => setViewType("WEEK")}
                className={`relative z-10 w-[82px] rounded-lg py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${viewType === "WEEK" ? "text-[#1a1f2e]" : "text-gray-400 hover:text-gray-600"}`}
              >
                WEEK
              </button>
              <button 
                onClick={() => setViewType("MONTH")}
                className={`relative z-10 w-[82px] rounded-lg py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${viewType === "MONTH" ? "text-[#1a1f2e]" : "text-gray-400 hover:text-gray-600"}`}
              >
                MONTH
              </button>
            </div>
          </div>
          
          <div className="relative h-72 w-full border-b border-l border-gray-100/50">
            {/* Simulated Chart Plot Area */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] w-full bg-blue-600/30"></div>
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-100"></div>
            
            <div className="flex h-full items-end justify-between px-4 pb-2 gap-0.5">
              {(chartSeries.length ? chartSeries : [{ label: "-", bookings: 0 }]).map((s, i) => {
                const h = (s.bookings / maxBook) * 100;
                return (
                  <div key={`${s.label}-${i}`} className="group relative min-w-[8px] flex-1 h-full">
                    <div
                      className="absolute bottom-0 w-full rounded-t-full bg-blue-600/40 transition-all group-hover:bg-blue-600"
                      style={{ height: `${Math.max(8, h)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between px-2 overflow-x-auto gap-1">
            {(chartSeries.length ? chartSeries : [{ label: "-", bookings: 0 }]).slice(-14).map((s, i) => (
              <span key={i} className="text-[10px] font-bold text-gray-400 truncate max-w-[3rem]">
                {s.label.length >= 10 ? s.label.slice(5) : s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity Card - Redesigned as Weekly Engagement Chart */}
        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50 flex flex-col">
          <h3 className="text-lg font-black text-[#1a1f2e] uppercase tracking-wider mb-2">Last 7 days</h3>
          <p className="mb-8 text-xs font-bold text-gray-400">Booking count by calendar day (from Firestore).</p>
          
          <div className="flex-1 space-y-4">
            {(weekEngagement.length ? weekEngagement : [{ label: "-", bookings: 0 }]).map((s, i) => {
              const d = Date.parse(s.label) ? new Date(s.label + "T12:00:00") : new Date();
              const day = DAY_SHORT[d.getDay()];
              const pct = (s.bookings / maxWeek) * 100;
              return (
                <div key={`${s.label}-${i}`} className="group flex items-center justify-between">
                  <span className="w-10 text-[10px] font-black uppercase tracking-widest text-[#1a1f2e] opacity-70 group-hover:opacity-100">
                    {day}
                  </span>
                  <div className="mx-3 h-3 flex-1 overflow-hidden rounded-full bg-gray-50">
                    <div
                      className="h-full rounded-full bg-[#ffca28] transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-[10px] font-black tabular-nums text-[#1a1f2e]">
                    {s.bookings}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Relative volume vs busiest day in this window
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="group rounded-[2.5rem] bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-gray-200/50">
      <div className="flex items-start justify-between mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f4f9] group-hover:bg-[#ffca28]/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
          {icon}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2.5 py-1 rounded-full group-hover:scale-110 transition-transform">
          <ArrowUpRight size={12} /> {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
        <h3 className="text-3xl font-black text-[#1a1f2e] tabular-nums">
          {value === "—" ? "—" : <NumberTicker value={value} />}
        </h3>
      </div>
    </div>
  );
}
