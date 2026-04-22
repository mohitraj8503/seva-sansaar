import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSeries } from "@/lib/server/businessStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";

export async function GET(req: NextRequest) {
  const auth = parseOwnerAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const series = await getAnalyticsSeries(auth.businessId, 8);
  return NextResponse.json({ series });
}
