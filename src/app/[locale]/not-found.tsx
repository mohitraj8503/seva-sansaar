"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/* Decorative Tricolor Bar */}
      <div className="flex h-1.5 w-full max-w-sm overflow-hidden rounded-full mb-8">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white border-y border-gray-100"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-100">404</h1>
        <div className="-mt-12">
          <h2 className="text-3xl font-bold text-[#1a2d5c]">Page Not Found</h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto">
            The service or page you are looking for does not exist or has been moved to a new government gateway.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 rounded-xl bg-[#1a2d5c] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-opacity-90 active:scale-95 shadow-lg shadow-[#1a2d5c]/20"
          >
            <Home size={18} /> Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>

      <p className="mt-16 text-xs font-medium text-gray-400 uppercase tracking-widest">
        Seva Sansaar • Digital Public Infrastructure
      </p>
    </div>
  );
}
