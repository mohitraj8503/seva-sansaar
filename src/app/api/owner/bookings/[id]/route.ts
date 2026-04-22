import { NextRequest, NextResponse } from "next/server";
import { setBookingStatus } from "@/lib/server/businessStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const auth = parseOwnerAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { status?: "pending" | "confirmed" | "cancelled" | "completed" };
  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }
  const row = await setBookingStatus(auth.businessId, auth.ownerSecret, id, body.status);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}
