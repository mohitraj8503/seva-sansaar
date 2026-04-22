/**
 * Shared TypeScript types for the entire Seva Sansaar platform.
 * Used by API routes, Firestore helpers, and UI components.
 */

// ——— Business ———————————————————————————————————————
export interface Business {
  id?: string; // Firestore document ID (omitted on create)
  slug: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  priceRange: string;
  phone: string;
  whatsapp: string;
  verified: boolean;
  vishwakarma: boolean;
  image: string; // URL (Pexels, Unsplash, or Firebase Storage)
  imageStoragePath?: string; // Firebase Storage path when uploaded via A9
  description: string;
  services: string[];
  serviceAreas: string[];
  hours: string;
  lat?: number;
  lng?: number;
  /** Registration workflow */
  status?: "pending" | "approved" | "rejected";
  createdAt?: string; // ISO 8601
  updatedAt?: string;
}

// ——— Review ——————————————————————————————————————————
export interface Review {
  id?: string;
  businessId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  rating: number; // 1–5
  comment: string;
  createdAt?: string;
  /** C8 moderation */
  hidden?: boolean;
  flagged?: boolean;
  flagReason?: string;
  moderatedAt?: string;
}

// ——— Booking —————————————————————————————————————————
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id?: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  userPhone: string;
  service: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: BookingStatus;
  notes?: string;
  address?: string;
  landmark?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Optional contact for confirmations */
  userEmail?: string;
  /** Set when created without Firebase Auth */
  guestBooking?: boolean;
  /** Estimated revenue for admin stats (optional) */
  estimatedAmount?: number;
}

// ——— Owner availability (C4) ————————————————————————————
export type DayHours = { open: string; close: string }; // "09:00", "18:00"

export interface BusinessAvailability {
  businessId: string;
  /** Default weekly hours Mon–Sun */
  weekly: Record<string, DayHours | null>; // "mon".."sun", null = closed
  /** ISO date strings blocked fully */
  blockedDates: string[];
  /** { date, start, end } half-day blocks */
  blockedSlots: { date: string; start: string; end: string }[];
  /** Override hours for specific dates */
  exceptions: Record<string, DayHours | null>;
  updatedAt?: string;
}

// ——— API helpers ————————————————————————————————————
export interface ApiError {
  error: string;
  details?: string;
}
