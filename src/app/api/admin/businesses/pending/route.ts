import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { listAllBusinessRecords, setBusinessApproval } from "@/lib/server/businessStore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { BusinessRecord } from "@/lib/types/owner";

export const dynamic = "force-dynamic";

/** GET — pending owner registrations (Firestore + local store) */
export async function GET(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  try {
    const fromStore = await listAllBusinessRecords();
    const pendingStore = fromStore.filter((b) => b.status === "pending");

    const db = getAdminDb();
    const pendingFs: BusinessRecord[] = [];
    if (db) {
      const snap = await db.collection("businesses").where("status", "==", "pending").get();
      for (const doc of snap.docs) {
        const row = doc.data() as BusinessRecord;
        if (!pendingStore.some((p) => p.id === row.id)) pendingFs.push({ ...row, id: doc.id });
      }
    }

    const map = new Map<string, BusinessRecord>();
    for (const b of pendingStore) map.set(b.id, b);
    for (const b of pendingFs) map.set(b.id, b);
    return NextResponse.json({ businesses: Array.from(map.values()) });
  } catch (e) {
    console.error("[GET /api/admin/businesses/pending]", e);
    return NextResponse.json({ error: "Failed to list pending" }, { status: 500 });
  }
}

/** PATCH — body: { businessId, action: 'approve' | 'reject' } */
export async function PATCH(req: NextRequest) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  try {
    const body = (await req.json()) as { businessId?: string; action?: "approve" | "reject" };
    if (!body.businessId || !body.action) {
      return NextResponse.json({ error: "businessId and action required" }, { status: 400 });
    }

    const verified = body.action === "approve";
    const status = body.action === "approve" ? "approved" : "rejected";

    await setBusinessApproval(body.businessId, status === "approved" ? "approved" : "rejected", verified);

    const db = getAdminDb();
    if (db) {
      await db.collection("businesses").doc(body.businessId).set(
        {
          status,
          verified,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true, businessId: body.businessId, status, verified });
  } catch (e) {
    console.error("[PATCH /api/admin/businesses/pending]", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
