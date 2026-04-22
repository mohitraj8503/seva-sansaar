/**
 * A6 – GET /api/bookings/user  — list all bookings for the authenticated user
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth-helpers";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const snapshot = await db
      .collection("bookings")
      .where("userId", "==", decoded.uid)
      .orderBy("createdAt", "desc")
      .get();

    const bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));

    return NextResponse.json(bookings);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/bookings/user]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
