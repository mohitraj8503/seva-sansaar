"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ownerAuthHeader, readOwnerSession } from "@/lib/ownerClient";

type Row = { week: string; views: number; inquiries: number; bookings: number };

export default function OwnerAnalyticsPage() {
  const [series, setSeries] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = readOwnerSession();
    if (!s) return;
    void (async () => {
      const res = await fetch("/api/owner/analytics", { headers: { ...ownerAuthHeader() } });
      if (res.ok) {
        const data = (await res.json()) as { series: Row[] };
        setSeries(data.series);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-gray-600">Loading analytics…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">Weekly views, WhatsApp/call taps, and bookings.</p>
      </div>

      <div className="h-80 w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" name="Profile views" stroke="#1a2d5c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="inquiries" name="Inquiries (WA/call)" stroke="#ff9933" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#138808" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500">
        Inquiry counts include WhatsApp and call button taps logged from your public profile. Views are counted when your profile page loads.
      </p>
    </div>
  );
}
