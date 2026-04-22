import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import type { BookingStatus } from "@/lib/types";

const VALID: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

export const dynamic = "force-dynamic";

/** PATCH — admin-only booking status update */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const { id } = await ctx.params;
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as { status?: BookingStatus };
    if (!body.status || !VALID.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ref = db.collection("bookings").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updatedAt = new Date().toISOString();
    await ref.update({ status: body.status, updatedAt });

    return NextResponse.json({ id, status: body.status, updatedAt });
  } catch (e) {
    console.error("[PATCH /api/admin/bookings/[id]]", e);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
