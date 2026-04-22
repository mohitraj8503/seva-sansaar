import { BadgeCheck } from "lucide-react";

export function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-india-green">
        <BadgeCheck size={14} className="shrink-0" aria-hidden />
        Verified
      </span>
    );
  }
  return (
    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">Pending verification</span>
  );
}
