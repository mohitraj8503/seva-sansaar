/**
 * POST /api/bookings/batch — fetch multiple bookings by id (for guest "My bookings" via localStorage ids)
 * Rate limited and returns only non-sensitive booking data.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_IDS = 40;

/**
 * Strip sensitive fields from booking responses.
 * eslint-disable-next-line @typescript-eslint/no-unused-vars — destructuring to remove fields
 */
function sanitizeBooking(booking: Booking): Partial<Booking> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userPhone, userEmail, userId, ...safe } = booking;
  return safe;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 50, RATE_LIMITS.DEFAULT.windowMs);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { ids } = (await req.json()) as { ids?: string[] };
    if (!ids?.length) {
      return NextResponse.json({ bookings: [] as Partial<Booking>[] });
    }
    const slice = ids.slice(0, MAX_IDS);
    const bookings: Partial<Booking>[] = [];

    const refs = slice.map(id => db.collection("bookings").doc(id));
    const docs = await db.getAll(...refs);

    docs.forEach(doc => {
      if (doc.exists) {
        const booking = { id: doc.id, ...(doc.data() as Omit<Booking, "id">) };
        bookings.push(sanitizeBooking(booking));
      }
    });

    return NextResponse.json({ bookings });
  } catch (e) {
    console.error("[POST /api/bookings/batch]", e);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
