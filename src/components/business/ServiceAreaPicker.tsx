"use client";

import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import { MapPin, Plus, X } from "lucide-react";

type Props = {
  value: ServiceAreaPlace[];
  onChange: (next: SetStateAction<ServiceAreaPlace[]>) => void;
};

export function ServiceAreaPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLoadError("Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for Places autocomplete.");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setOptions({ key });
        await importLibrary("places") as google.maps.PlacesLibrary;
        if (cancelled || !inputRef.current) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["place_id", "formatted_address", "geometry", "name"],
          types: ["(regions)"],
        });
        ac.addListener("place_changed", () => {
          const p = ac.getPlace();
          const placeId = p.place_id;
          const loc = p.geometry?.location;
          if (!placeId || !loc) return;
          const label = p.formatted_address ?? p.name ?? "Area";
          const next: ServiceAreaPlace = {
            placeId,
            label,
            lat: loc.lat(),
            lng: loc.lng(),
          };
          onChange((prev) => {
            if (prev.some((v) => v.placeId === next.placeId)) return prev;
            return [...prev, next];
          });
          if (inputRef.current) inputRef.current.value = "";
        });
        setReady(true);
      } catch {
        setLoadError("Could not load Google Maps.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  const remove = useCallback(
    (placeId: string) => {
      onChange(value.filter((v) => v.placeId !== placeId));
    },
    [onChange, value]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Service areas (Google Places)</label>
      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
        <MapPin size={16} className="text-gray-400" />
        <input
          ref={inputRef}
          disabled={!ready && !loadError}
          placeholder={loadError ? "Enter areas manually below" : "Search city, locality, or pincode…"}
          className="min-w-[200px] flex-1 border-0 bg-transparent text-sm outline-none"
        />
        {ready && <Plus size={16} className="text-gray-400" aria-hidden />}
      </div>
      {loadError && (
        <p className="text-xs text-amber-700">
          {loadError} You can still submit without map areas; add locality names in the address field.
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {value.map((a) => (
          <li
            key={a.placeId}
            className="inline-flex items-center gap-1 rounded-full bg-[#1a2d5c]/10 px-3 py-1 text-xs font-semibold text-[#1a2d5c]"
          >
            {a.label}
            <button type="button" onClick={() => remove(a.placeId)} className="rounded-full p-0.5 hover:bg-black/10" aria-label="Remove">
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}