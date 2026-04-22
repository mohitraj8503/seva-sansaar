import { JAMSHEDPUR_REGION } from "@/lib/geo/jamshedpurRegion";

export type CityConfig = {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  radiusKm: number;
  active: boolean;
};

export const SUPPORTED_CITIES: CityConfig[] = [
  {
    id: "jamshedpur",
    name: "Jamshedpur",
    displayName: "Jamshedpur, Jharkhand",
    lat: JAMSHEDPUR_REGION.center.lat,
    lng: JAMSHEDPUR_REGION.center.lng,
    radiusKm: 25,
    active: true,
  },
  {
    id: "ranchi",
    name: "Ranchi",
    displayName: "Ranchi, Jharkhand",
    lat: 23.3441,
    lng: 85.3096,
    radiusKm: 20,
    active: false, // Coming soon
  },
  {
    id: "dhanbad",
    name: "Dhanbad",
    displayName: "Dhanbad, Jharkhand",
    lat: 23.7957,
    lng: 86.4304,
    radiusKm: 20,
    active: false, // Coming soon
  },
];

export const DEFAULT_CITY = SUPPORTED_CITIES[0];
