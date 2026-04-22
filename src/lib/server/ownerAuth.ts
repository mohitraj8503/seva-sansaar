import type { NextRequest } from "next/server";

/**
 * Parse owner authentication header.
 * Expects: Authorization: Bearer <base64({businessId, ownerSecret})>
 * 
 * SECURITY NOTE: This sends the secret with every request. In production,
 * migrate to short-lived JWT tokens with refresh mechanism.
 */
export function parseOwnerAuth(req: NextRequest): { businessId: string; ownerSecret: string } | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  try {
    const raw = h.slice(7).trim();
    const json = Buffer.from(raw, "base64").toString("utf8");
    const o = JSON.parse(json) as { businessId?: string; ownerSecret?: string };
    if (!o.businessId || !o.ownerSecret) return null;
    return { businessId: o.businessId, ownerSecret: o.ownerSecret };
  } catch {
    return null;
  }
}

/**
 * Verify owner credentials against stored hash.
 * Returns true if credentials match.
 */
export function verifyOwnerCredentials(
  storedHash: string | undefined,
  providedSecret: string
): boolean {
  if (!storedHash) return false;
  // Simple string comparison — in production use bcrypt
  return storedHash === providedSecret;
}
