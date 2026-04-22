import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ bookings: [] as Booking[] });
  }

  try {
    const snap = await db.collection("bookings").limit(500).get();
    const bookings: Booking[] = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Booking, "id">) }))
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error("[GET /api/admin/bookings]", e);
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}
