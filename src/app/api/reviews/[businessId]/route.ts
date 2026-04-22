/**
 * A5 – GET /api/reviews/[businessId]  — list reviews for a business
 * Supports pagination via ?limit=20&offset=0 query params.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Review } from "@/lib/types";

const CACHE_MAX_AGE = 60; // 60 seconds

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await ctx.params;
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json([] as Review[]);
    }

    // Parse pagination params
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const limit = Math.min(Math.max(parseInt(limitParam ?? "20", 10) || 20, 1), 50);
    const offset = Math.max(parseInt(offsetParam ?? "0", 10) || 0, 0);

    // Firestore doesn't support offset natively, so fetch (offset + limit) and slice
    const snapshot = await db
      .collection("reviews")
      .where("businessId", "==", businessId)
      .orderBy("createdAt", "desc")
      .limit(offset + limit)
      .get();

    const allReviews = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }))
      .filter((r) => !r.hidden);

    // Apply offset client-side
    const reviews = allReviews.slice(offset, offset + limit);

    const response = NextResponse.json(reviews);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=300`
    );
    return response;
  } catch (err) {
    console.error("[GET /api/reviews/[businessId]]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
