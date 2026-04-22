/**
 * Prevents open redirects: only same-origin pathnames, no // or protocols.
 */
export function safeInternalPath(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//") || /:\/\//.test(t)) return fallback;
  const path = t.split("?")[0].split("#")[0];
  if (!path.startsWith("/") || path.length > 512) return fallback;
  return path || fallback;
}

/** Post-login target for Firebase admin users — must stay under /admin. */
export function safeAdminPostLoginRedirect(raw: string | null | undefined): string {
  const p = safeInternalPath(raw, "/admin");
  return p.includes("/admin") ? p : "/admin";
}

/** Post-login target for business owners — only /dashboard subtree. */
export function safeOwnerPostLoginRedirect(raw: string | null | undefined): string {
  const p = safeInternalPath(raw, "/dashboard");
  return p.startsWith("/dashboard") ? p : "/dashboard";
}
