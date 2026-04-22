import { NextRequest, NextResponse } from "next/server";
import { listBookingsForBusiness, seedBookingsIfEmpty } from "@/lib/server/businessStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  try {
    const auth = parseOwnerAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedBookingsIfEmpty(auth.businessId);
    const rows = await listBookingsForBusiness(auth.businessId);

    // Pagination
    const url = new URL(req.url);
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0
      ? Math.min(pageSizeParam, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRows = rows.slice(startIndex, endIndex);

    return NextResponse.json({
      bookings: paginatedRows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    console.error("[GET /api/owner/bookings]", e);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}
