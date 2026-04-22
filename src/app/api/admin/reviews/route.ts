import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET — all reviews for moderation queue */
export async function GET(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const db = getAdminDb();
  if (!db) {
    // Return mock reviews for demo/development
    const mockReviews: Review[] = [
      {
        id: "rev-1",
        businessId: "biz-1",
        userId: "user-1",
        displayName: "Aryan Verma",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        comment: "Excellent service! Fixed my MCB within 20 minutes of arrival.",
        createdAt: "2024-04-10T10:00:00Z",
      },
      {
        id: "rev-2",
        businessId: "biz-2",
        userId: "user-2",
        displayName: "Neha Singh",
        avatarUrl: "https://i.pravatar.cc/150?img=2",
        rating: 4,
        comment: "Great teacher, very patient with my kids. Highly recommended.",
        createdAt: "2024-04-09T15:30:00Z",
      },
      {
        id: "rev-3",
        businessId: "biz-3",
        userId: "user-3",
        displayName: "Priya Sharma",
        avatarUrl: "https://i.pravatar.cc/150?img=3",
        rating: 5,
        comment: "Best salon in Mango. Clean and professional.",
        createdAt: "2024-04-08T11:20:00Z",
        flagged: true,
        flagReason: "Contains external link",
      },
    ];
    return NextResponse.json({ reviews: mockReviews, note: "Live demo mode: Displaying simulated reviews" });
  }

  try {
    const snap = await db.collection("reviews").limit(300).get();
    const reviews: Review[] = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }))
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return NextResponse.json({ reviews });
  } catch (e) {
    console.error("[GET /api/admin/reviews]", e);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

/** PATCH — body: { reviewId, hidden?: boolean, flagged?: boolean, flagReason?: string } */
export async function PATCH(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as {
      reviewId?: string;
      hidden?: boolean;
      flagged?: boolean;
      flagReason?: string;
    };
    if (!body.reviewId) {
      return NextResponse.json({ error: "reviewId required" }, { status: 400 });
    }

    const ref = db.collection("reviews").doc(body.reviewId);
    const now = new Date().toISOString();
    await ref.set(
      {
        ...(body.hidden !== undefined ? { hidden: body.hidden } : {}),
        ...(body.flagged !== undefined ? { flagged: body.flagged } : {}),
        ...(body.flagReason !== undefined ? { flagReason: body.flagReason } : {}),
        moderatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, reviewId: body.reviewId });
  } catch (e) {
    console.error("[PATCH /api/admin/reviews]", e);
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}
