"use client";

export const OWNER_SESSION_KEY = "seva_owner_session";

export type OwnerSession = {
  businessId: string;
  ownerSecret: string;
  email: string;
  name?: string;
};

export function readOwnerSession(): OwnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OWNER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OwnerSession;
  } catch {
    return null;
  }
}

export function writeOwnerSession(s: OwnerSession) {
  localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(s));
}

export function clearOwnerSession() {
  localStorage.removeItem(OWNER_SESSION_KEY);
}

export function ownerAuthHeader(): HeadersInit {
  const s = readOwnerSession();
  if (!s) return {};
  const token = typeof btoa !== "undefined"
    ? btoa(JSON.stringify({ businessId: s.businessId, ownerSecret: s.ownerSecret }))
    : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}
