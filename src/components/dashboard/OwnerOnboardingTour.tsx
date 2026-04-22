"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Sparkles, X } from "lucide-react";

const TOUR_KEY = "seva_owner_onboarding_done";

const steps = [
  {
    title: "Welcome to your business hub",
    body: "Manage your listing, bookings, and performance from this dashboard. You can return here anytime after login.",
  },
  {
    title: "Listing & verification",
    body: "Update services, hours, and photos under My Listing. Your profile stays “Pending” until an admin approves it—then the Verified badge appears to customers.",
  },
  {
    title: "Bookings & analytics",
    body: "Confirm or cancel requests in Bookings. Analytics shows weekly views, WhatsApp/call taps, and bookings so you can see what is working.",
  },
];

export function OwnerOnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (localStorage.getItem(TOUR_KEY) === "1") return;
      setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!open) return null;

  const finish = () => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const s = steps[step]!;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-desc"
      >
        <button
          type="button"
          onClick={finish}
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close tour"
        >
          <X size={18} />
        </button>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1a2d5c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a2d5c]">
          <Sparkles size={14} />
          First-time guide
        </div>
        <h2 id="tour-title" className="text-lg font-black text-gray-900">
          {s.title}
        </h2>
        <p id="tour-desc" className="mt-2 text-sm leading-relaxed text-gray-600">
          {s.body}
        </p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === step ? "bg-[#1a2d5c]" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((x) => Math.max(0, x - 1))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((x) => x + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#1a2d5c] px-4 py-2 text-sm font-bold text-white hover:bg-[#132246]"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-lg bg-[#ff9933] px-4 py-2 text-sm font-bold text-white hover:opacity-95"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
