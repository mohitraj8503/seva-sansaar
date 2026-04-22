"use client";
import { MapPin, PenBox } from "lucide-react";

export default function LocationPersonalization() {
  return (
    <section className="bg-white pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-[#f9fafb] p-6">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]">
            <MapPin size={16} /> LOCATION: Patna, Bihar
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-700">Current Location Detected</p>
              <p className="mt-1 text-sm text-gray-500">Based on your device</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                <PenBox size={14} /> Change Location
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-700">Services near you</p>
              <p className="mt-1 text-sm text-gray-500">12 services found</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
