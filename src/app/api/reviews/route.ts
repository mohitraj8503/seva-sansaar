/**
 * A5 – POST /api/reviews  — submit a new review (authenticated users only)
 * Also updates the aggregated rating on the business document.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import type { Review } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Rate limiting
    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`review-create:${ip}`, RATE_LIMITS.REVIEW_CREATE.max, RATE_LIMITS.REVIEW_CREATE.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many review submissions. Please try again later." }, { status: 429 });
    }

    const decoded = await requireAuth(req);
    const body = (await req.json()) as Omit<Review, "id" | "userId" | "createdAt">;

    // Input validation
    if (!body.businessId || typeof body.businessId !== "string") {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }
    if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (body.comment && typeof body.comment === "string" && body.comment.length > 2000) {
      return NextResponse.json({ error: "Comment must be 2000 characters or less" }, { status: 400 });
    }

    // Prevent duplicate reviews
    const existingReview = await db
      .collection("reviews")
      .where("businessId", "==", body.businessId)
      .where("userId", "==", decoded.uid)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json({ error: "You have already reviewed this business" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const review: Omit<Review, "id"> = {
      ...body,
      userId: decoded.uid,
      createdAt: now,
      hidden: false,
      flagged: false,
    };

    const docRef = await db.collection("reviews").add(review);

    // Use FieldValue.increment() for atomic updates to prevent race conditions
    const { FieldValue } = await import("firebase-admin/firestore");
    const bizRef = db.collection("businesses").doc(body.businessId);
    const bizDoc = await bizRef.get();
    if (bizDoc.exists) {
      const data = bizDoc.data()!;
      const oldRating = (data.rating as number) || 0;
      const oldReviews = (data.reviews as number) || 0;
      const newReviews = oldReviews + 1;
      const newRating = parseFloat(((oldRating * oldReviews + body.rating) / newReviews).toFixed(1));
      await bizRef.update({
        rating: newRating,
        reviews: FieldValue.increment(1),
        updatedAt: now,
      });
    }

    return NextResponse.json({ id: docRef.id, ...review }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
