import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";
import type { BusinessAvailability } from "@/lib/types";

export const dynamic = "force-dynamic";

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidTimeFormat(time: string): boolean {
  return TIME_FORMAT_REGEX.test(time);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function validateWeeklySchedule(weekly: Record<string, unknown>): string | null {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (const day of days) {
    const entry = weekly[day];
    if (entry === null || entry === undefined) continue;
    if (typeof entry !== "object" || entry === null) {
      return `Invalid format for ${day}: must be an object with open/close or null.`;
    }
    const { open, close } = entry as { open?: unknown; close?: unknown };
    if (typeof open !== "string" || typeof close !== "string") {
      return `open and close for ${day} must be strings in HH:MM format.`;
    }
    if (!isValidTimeFormat(open)) {
      return `Invalid open time for ${day}: "${open}". Expected HH:MM format (00:00-23:59).`;
    }
    if (!isValidTimeFormat(close)) {
      return `Invalid close time for ${day}: "${close}". Expected HH:MM format (00:00-23:59).`;
    }
    if (timeToMinutes(open) >= timeToMinutes(close)) {
      return `Open time must be before close time for ${day}: "${open}" >= "${close}".`;
    }
  }
  return null;
}

function sanitizeWeeklyInput(weekly: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  for (const day of days) {
    const entry = weekly[day];
    if (entry === null || entry === undefined) {
      sanitized[day] = entry;
      continue;
    }
    if (typeof entry === "object" && entry !== null) {
      const { open, close } = entry as { open?: string; close?: string };
      sanitized[day] = {
        open: typeof open === "string" ? open.trim() : open,
        close: typeof close === "string" ? close.trim() : close,
      };
    }
  }
  return sanitized;
}

const defaultWeekly: BusinessAvailability["weekly"] = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  wed: { open: "09:00", close: "18:00" },
  thu: { open: "09:00", close: "18:00" },
  fri: { open: "09:00", close: "18:00" },
  sat: { open: "09:00", close: "14:00" },
  sun: null,
};

export async function GET(req: NextRequest) {
  const auth = parseOwnerAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({
      availability: {
        businessId: auth.businessId,
        weekly: defaultWeekly,
        blockedDates: [],
        blockedSlots: [],
        exceptions: {},
      } satisfies BusinessAvailability,
    });
  }

  const doc = await db.collection("availability").doc(auth.businessId).get();
  if (!doc.exists) {
    return NextResponse.json({
      availability: {
        businessId: auth.businessId,
        weekly: defaultWeekly,
        blockedDates: [],
        blockedSlots: [],
        exceptions: {},
      } satisfies BusinessAvailability,
    });
  }
  return NextResponse.json({ availability: doc.data() as BusinessAvailability });
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = parseOwnerAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as Partial<BusinessAvailability>;
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Validate weekly schedule if provided
    if (body.weekly !== undefined) {
      if (typeof body.weekly !== "object" || body.weekly === null) {
        return NextResponse.json({ error: "weekly must be an object." }, { status: 400 });
      }
      const sanitizedWeekly = sanitizeWeeklyInput(body.weekly as Record<string, unknown>);
      const validationError = validateWeeklySchedule(sanitizedWeekly);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      body.weekly = sanitizedWeekly as BusinessAvailability["weekly"];
    }

    // Sanitize array fields
    const blockedDates = Array.isArray(body.blockedDates) ? body.blockedDates.map((d) => String(d).trim()) : [];
    const blockedSlots = Array.isArray(body.blockedSlots)
      ? body.blockedSlots
          .filter((s) => typeof s === "object" && s !== null && "date" in s && "start" in s && "end" in s)
          .map((s) => {
            const slot = s as { date: string; start: string; end: string };
            return {
              date: String(slot.date).trim(),
              start: String(slot.start).trim(),
              end: String(slot.end).trim(),
            };
          })
      : [];

    // Sanitize exceptions (Record<string, DayHours | null>)
    const exceptions: Record<string, { open: string; close: string } | null> = {};
    if (typeof body.exceptions === "object" && body.exceptions !== null) {
      for (const [key, value] of Object.entries(body.exceptions)) {
        const trimmedKey = key.trim();
        if (value === null || value === undefined) {
          exceptions[trimmedKey] = null;
        } else if (typeof value === "object" && "open" in value && "close" in value) {
          const dh = value as { open?: unknown; close?: unknown };
          exceptions[trimmedKey] = {
            open: typeof dh.open === "string" ? dh.open.trim() : String(dh.open ?? ""),
            close: typeof dh.close === "string" ? dh.close.trim() : String(dh.close ?? ""),
          };
        }
      }
    }

    const now = new Date().toISOString();
    const payload: BusinessAvailability = {
      businessId: auth.businessId,
      weekly: (body.weekly ?? defaultWeekly) as BusinessAvailability["weekly"],
      blockedDates,
      blockedSlots,
      exceptions,
      updatedAt: now,
    };

    await db.collection("availability").doc(auth.businessId).set(payload, { merge: true });
    return NextResponse.json({ availability: payload });
  } catch (e) {
    console.error("[PATCH /api/owner/availability]", e);
    return NextResponse.json({ error: "Failed to update availability." }, { status: 500 });
  }
}
