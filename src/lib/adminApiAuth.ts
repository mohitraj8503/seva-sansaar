import type { NextRequest } from "next/server";
import { requireAuth, forbidden } from "./auth-helpers";

let warnedOpenAdminDev = false;

/**
 * Robust API authentication for admin routes.
 * Verifies the Firebase ID Token and checks the user's email against ADMIN_EMAILS.
 * Returns true if the user is an admin, false otherwise.
 */
export async function assertAdminApi(req: NextRequest): Promise<boolean> {
  try {
    const user = await requireAuth(req);
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // Development fallback if no emails are configured
    if (adminEmails.length === 0 && process.env.NODE_ENV === "development") {
      if (!warnedOpenAdminDev) {
        warnedOpenAdminDev = true;
        console.warn(
          "[adminApiAuth] ADMIN_EMAILS is empty: any authenticated Firebase user can call admin APIs in development. Set ADMIN_EMAILS in production."
        );
      }
      return true;
    }

    return adminEmails.includes(user.email?.toLowerCase() || "");
  } catch {
    return false;
  }
}

/**
 * Assert the request is from an admin user. Throws a 403 if not.
 */
export async function requireAdminApi(req: NextRequest): Promise<void> {
  const isAdmin = await assertAdminApi(req);
  if (!isAdmin) {
    forbidden("Admin access required");
  }
}

/**
 * Return a standardized 401 Unauthorized response.
 */
export function adminUnauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
