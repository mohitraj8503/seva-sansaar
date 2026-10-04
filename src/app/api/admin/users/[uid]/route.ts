import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi, adminUnauthorized } from "@/lib/adminApiAuth";
import { getAdminApp } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * PATCH { disabled: boolean }
 * Disable / enable a Firebase user account.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ uid: string }> }
) {
  if (!(await assertAdminApi(req))) {
    return adminUnauthorized();
  }

  const { uid } = await ctx.params;

  const app = getAdminApp();

  if (!app) {
    return NextResponse.json(
      { error: "Firebase Admin not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      disabled?: boolean;
    };

    if (typeof body.disabled !== "boolean") {
      return NextResponse.json(
        { error: "disabled boolean required" },
        { status: 400 }
      );
    }

    // Use the initialized Admin app instead of importing
    // firebase-admin/auth directly.
    const auth = app.auth();

    await auth.updateUser(uid, {
      disabled: body.disabled,
    });

    return NextResponse.json({
      ok: true,
      uid,
      disabled: body.disabled,
    });
  } catch (error: unknown) {
    console.error("[PATCH /api/admin/users/[uid]]", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}