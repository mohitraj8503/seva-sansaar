/**
 * A6 – PATCH /api/bookings/[id]/status  — update booking status
 * Guest cancellations: pass { status, guestPhone } matching the booking phone.
 * Rate limited for guest cancellations to prevent abuse.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import type { BookingStatus } from "@/lib/types";

const VALID_STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.BOOKING_CREATE.max, RATE_LIMITS.BOOKING_CREATE.windowMs);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await ctx.params;
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = (await req.json()) as { status: BookingStatus; guestPhone?: string };
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value. Must be one of: pending, confirmed, cancelled, completed." }, { status: 400 });
    }

    const docRef = db.collection("bookings").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const existing = snapshot.data() as Record<string, unknown>;
    const userId = String(existing.userId ?? "");

    const decoded = await verifyToken(req);

    let allowed = false;
    if (decoded) {
      allowed = existing.userId === decoded.uid || decoded.admin === true;
    } else if (userId.startsWith("guest:") && body.guestPhone) {
      const gp = normalizePhone(body.guestPhone);
      allowed = userId === `guest:${gp}`;
    }

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden. You can only modify your own bookings." }, { status: 403 });
    }

    const updatedAt = new Date().toISOString();
    await docRef.update({ status, updatedAt });

    return NextResponse.json({ id, status, updatedAt });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/bookings/[id]/status]", err);
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
  }
}
