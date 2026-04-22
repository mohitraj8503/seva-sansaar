import React from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="h-48 w-full rounded-2xl bg-gray-100 md:h-56 md:w-72" />
        <div className="flex-1 space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-1/3 rounded bg-gray-100" />
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
          <div className="h-4 w-1/4 rounded bg-gray-100" />
          <div className="flex gap-4">
            <div className="h-4 w-16 rounded bg-gray-100" />
            <div className="h-4 w-16 rounded bg-gray-100" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-3/4 rounded bg-gray-100" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-32 rounded-xl bg-gray-100" />
            <div className="h-10 w-32 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
