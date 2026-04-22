/** API + UI shape for hyperlocal provider search */
export type ProviderSearchHit = {
  source: "seed" | "registered";
  id?: string;
  slug: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  rating: number;
  reviews: number;
  completionRate: number;
  responseTimeMin: number;
  priceRange: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  image: string;
  description: string;
  lat: number;
  lng: number;
  distanceKm: number;
  score: number;
};

export type NearbyProvidersResponse = {
  center: { lat: number; lng: number };
  mode: "nearest" | "recommended";
  radiusKm: number;
  coldStart: boolean;
  region: string;
  results: ProviderSearchHit[];
  warning?: string;
};
