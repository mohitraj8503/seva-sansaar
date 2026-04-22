/**
 * Service boundary for hyperlocal discovery: Jamshedpur urban agglomeration
 * including Adityapur, Gamharia, Kandra, and nearby pockets (~20 km scale).
 * Bounds are approximate; tighten with admin GIS later.
 */
export const JAMSHEDPUR_REGION = {
  name: "Jamshedpur metropolitan area",
  /** Default map / search centroid (Arka Jain University / Gamharia area) */
  center: { lat: 22.715, lng: 86.076 },
  /** Axis-aligned bounding box (WGS84) */
  bounds: {
    minLat: 22.68,
    maxLat: 22.93,
    minLng: 85.98,
    maxLng: 86.42,
  },
} as const;

export function isInJamshedpurRegion(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = JAMSHEDPUR_REGION.bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/** Known sub-areas for copy / filters (non-exhaustive) */
export const JAMSHEDPUR_LOCALITIES = [
  "Sakchi",
  "Bistupur",
  "Telco",
  "Mango",
  "Kadma",
  "Sonari",
  "Baridih",
  "Adityapur",
  "Gamharia",
  "Kandra",
  "Golmuri",
  "Jugsalai",
] as const;
