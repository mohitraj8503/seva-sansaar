import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const db = getAdminDb();
  if (!db) {
    // Return high-quality mock data for demo/development purposes
    const now = new Date();
    const mockSeries = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return {
        label: d.toISOString().slice(0, 10),
        bookings: Math.floor(Math.random() * 20) + 10,
      };
    });

    return NextResponse.json({
      bookingsTotal: 1428,
      bookingsToday: 42,
      revenueEstimate: 842600,
      providersActive: 156,
      providersPending: 12,
      usersApprox: 4500,
      series: mockSeries,
      completionRatePct: 94.2,
      categoryBreakdown: [
        { name: "Electrician", count: 45, pct: 28.8 },
        { name: "Plumber", count: 32, pct: 20.5 },
        { name: "AC Repair", count: 28, pct: 17.9 },
        { name: "Tutor", count: 24, pct: 15.4 },
        { name: "Others", count: 27, pct: 17.4 },
      ],
      note: "Live demo mode: Displaying simulated data",
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    // 1. Fast counts for totals/status
    const [bookingsTotalSnap, bookingsTodaySnap, activeSnap, pendingSnap, completedSnap] = await Promise.all([
      db.collection("bookings").count().get(),
      db.collection("bookings").where("date", "==", today).count().get(),
      db.collection("businesses").where("status", "!=", "rejected").where("verified", "==", true).count().get(),
      db.collection("businesses").where("status", "==", "pending").count().get(),
      db.collection("bookings").where("status", "==", "completed").count().get(),
    ]);

    // 2. Revenue estimate (still requires document fetch, but we can limit to non-cancelled ones)
    // For small/medium scale, this is okay. For large scale, a separate 'stats' doc should be used.
    const revenueSnap = await db.collection("bookings").where("status", "!=", "cancelled").select("estimatedAmount").get();
    let revenueEstimate = 0;
    revenueSnap.forEach((d) => {
      const amt = d.data().estimatedAmount;
      if (typeof amt === "number") revenueEstimate += amt;
    });

    // 3. Last 30 days series (dashboard WEEK/MONTH toggles slice this client-side)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const seriesSnap = await db.collection("bookings")
      .where("createdAt", ">=", thirtyDaysAgo.toISOString())
      .select("createdAt")
      .get();

    const seriesMap = new Map<string, number>();
    seriesSnap.forEach((d) => {
      const c = d.data().createdAt as string;
      const day = c.slice(0, 10);
      seriesMap.set(day, (seriesMap.get(day) ?? 0) + 1);
    });

    const series = Array.from(seriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, bookings]) => ({ label, bookings }));

    const totalBookings = bookingsTotalSnap.data().count;
    const completedCount = completedSnap.data().count;
    const completionRatePct =
      totalBookings === 0 ? 0 : Math.round((completedCount / totalBookings) * 1000) / 10;

    // Category distribution (verified / active listings)
    const bizSnap = await db.collection("businesses").where("verified", "==", true).select("category").limit(2000).get();
    const catMap = new Map<string, number>();
    bizSnap.forEach((d) => {
      const c = String((d.data() as { category?: string }).category || "Other").trim() || "Other";
      catMap.set(c, (catMap.get(c) ?? 0) + 1);
    });
    const catTotal = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    const categoryBreakdown = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / catTotal) * 1000) / 10,
      }));

    return NextResponse.json({
      bookingsTotal: bookingsTotalSnap.data().count,
      bookingsToday: bookingsTodaySnap.data().count,
      revenueEstimate,
      providersActive: activeSnap.data().count,
      providersPending: pendingSnap.data().count,
      usersApprox: 0,
      series,
      completionRatePct,
      categoryBreakdown,
    });
  } catch (e) {
    console.error("[GET /api/admin/stats]", e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
