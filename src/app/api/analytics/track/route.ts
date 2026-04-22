import { NextRequest, NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/server/businessStore";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import type { AnalyticsEventType } from "@/lib/types/owner";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`analytics:${ip}`, RATE_LIMITS.ANALYTICS.max, RATE_LIMITS.ANALYTICS.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = (await req.json()) as { businessId?: string; type?: AnalyticsEventType; metadata?: Record<string, unknown> };

    if (!body.businessId || !body.type) {
      return NextResponse.json({ error: "businessId and type required" }, { status: 400 });
    }

    // Validate businessId exists
    const db = getAdminDb();
    if (db) {
      const bizDoc = await db.collection("businesses").doc(body.businessId).get();
      if (!bizDoc.exists) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }
    }

    // Sanitize and validate event type
    const allowed: AnalyticsEventType[] = ["view", "whatsapp", "call", "inquiry"];
    if (!allowed.includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }

    // Sanitize metadata: only allow string/number/boolean values, limit key count
    let sanitizedMetadata: Record<string, string | number | boolean> | undefined;
    if (body.metadata && typeof body.metadata === "object") {
      sanitizedMetadata = {};
      const entries = Object.entries(body.metadata).slice(0, 10);
      for (const [key, value] of entries) {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
        if (typeof value === "string") {
          sanitizedMetadata[sanitizedKey] = value.slice(0, 200);
        } else if (typeof value === "number" || typeof value === "boolean") {
          sanitizedMetadata[sanitizedKey] = value;
        }
      }
    }

    await logAnalyticsEvent(body.businessId, body.type);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "track failed" }, { status: 500 });
  }
}
