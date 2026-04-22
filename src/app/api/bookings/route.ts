/**
 * A6 – POST /api/bookings — authenticated Firebase users OR guest booking (guestBooking: true)
 * GET /api/bookings — admin only (returns paginated bookings)
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendBookingConfirmation } from "@/lib/notifications/send";
import { normalizePhone } from "@/lib/phone";
import { validateBookingForm, sanitizeText } from "@/lib/validation";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Only allow POST and GET */
export async function GET(req: NextRequest) {
  try {
    // Admin-only endpoint
    const { requireAdminApi } = await import("@/lib/adminApiAuth");
    const isAdmin = await requireAdminApi(req).then(() => true).catch(() => false);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const statusFilter = searchParams.get("status");

    let query = db.collection("bookings").orderBy("createdAt", "desc");
    if (statusFilter) {
      query = query.where("status", "==", statusFilter);
    }

    const snapshot = await query.get();
    const allBookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const paginated = allBookings.slice(offset, offset + limit);

    return NextResponse.json({
      bookings: paginated,
      pagination: { total: allBookings.length, limit, offset, hasMore: offset + limit < allBookings.length },
    });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.BOOKING_CREATE.max, RATE_LIMITS.BOOKING_CREATE.windowMs);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = (await req.json()) as Partial<Booking> & {
      guestBooking?: boolean;
      address?: string;
      landmark?: string;
    };

    // Validate required fields
    if (!body.businessId || !body.service || !body.date || !body.timeSlot || !body.businessName) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    // Sanitize inputs
    const service = sanitizeText(body.service, 100);
    const businessName = sanitizeText(body.businessName, 200);
    const notes = body.notes ? sanitizeText(body.notes, 500) : undefined;
    const address = body.address ? sanitizeText(body.address, 500) : undefined;
    const landmark = body.landmark ? sanitizeText(body.landmark, 200) : undefined;
    const userName = body.userName ? sanitizeText(body.userName, 100) : undefined;

    // Validate form if guest booking
    if (body.guestBooking === true) {
      const validation = validateBookingForm({
        date: body.date,
        timeSlot: body.timeSlot,
        userName,
        userPhone: body.userPhone,
        address,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
      }
    }

    const decoded = await verifyToken(req);
    const now = new Date().toISOString();

    let booking: Omit<Booking, "id">;

    if (decoded) {
      booking = {
        businessId: body.businessId,
        businessName,
        userId: decoded.uid,
        userName: userName ?? decoded.name ?? "Customer",
        userPhone: body.userPhone ?? "",
        userEmail: body.userEmail,
        service,
        date: body.date,
        timeSlot: body.timeSlot,
        status: "pending",
        notes,
        address,
        landmark,
        guestBooking: false,
        estimatedAmount: body.estimatedAmount,
        createdAt: now,
        updatedAt: now,
      };
    } else if (body.guestBooking === true) {
      if (!userName?.trim() || !body.userPhone?.trim()) {
        return NextResponse.json({ error: "Guest bookings require userName and userPhone" }, { status: 400 });
      }
      const phone = normalizePhone(body.userPhone);
      booking = {
        businessId: body.businessId,
        businessName,
        userId: `guest:${phone}`,
        userName: userName.trim(),
        userPhone: body.userPhone.trim(),
        userEmail: body.userEmail,
        service,
        date: body.date,
        timeSlot: body.timeSlot,
        status: "pending",
        notes,
        address,
        landmark,
        guestBooking: true,
        estimatedAmount: body.estimatedAmount,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      return NextResponse.json({ error: "Unauthorized. Please log in or mark as guest booking." }, { status: 401 });
    }

    const docRef = await db.collection("bookings").add(booking);
    const id = docRef.id;

    void sendBookingConfirmation({
      toEmail: booking.userEmail,
      toPhone: booking.userPhone,
      customerName: booking.userName,
      businessName: booking.businessName,
      service: booking.service,
      date: booking.date,
      timeSlot: booking.timeSlot,
      bookingId: id,
    });

    return NextResponse.json({ id, ...booking }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
