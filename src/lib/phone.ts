/** Normalize to E.164-ish digits for comparison */
export function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length >= 10) return d;
  return d;
}
