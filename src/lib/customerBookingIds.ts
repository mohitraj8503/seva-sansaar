"use client";

const KEY = "seva_booking_ids";

export function rememberBookingId(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!arr.includes(id)) {
      arr.unshift(id);
      localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 50)));
    }
  } catch {
    /* ignore */
  }
}

export function getStoredBookingIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
