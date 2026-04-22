import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** PATCH { disabled: boolean } — disable/enable account (C7; impersonation not implemented for safety) */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ uid: string }> }
) {
  if (!(await assertAdminApi(req))) return adminUnauthorized();

  const { uid } = await ctx.params;
  const app = getAdminApp();
  if (!app) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as { disabled?: boolean };
    if (typeof body.disabled !== "boolean") {
      return NextResponse.json({ error: "disabled boolean required" }, { status: 400 });
    }
    const auth = getAuth(app);
    await auth.updateUser(uid, { disabled: body.disabled });
    return NextResponse.json({ ok: true, uid, disabled: body.disabled });
  } catch (e) {
    console.error("[PATCH /api/admin/users/[uid]]", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
