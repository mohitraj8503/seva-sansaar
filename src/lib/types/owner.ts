export type BusinessStatus = "pending" | "approved" | "rejected";

export type ServiceAreaPlace = {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
};

export type BusinessRecord = {
  id: string;
  ownerEmail: string;
  passwordHash: string;
  ownerSecret: string;
  slug: string;
  name: string;
  category: string;
  services: string[];
  phone: string;
  whatsapp: string;
  address: string;
  locality: string;
  city: string;
  hours: string;
  pricing: string;
  description: string;
  photoUrls: string[];
  serviceAreas: ServiceAreaPlace[];
  status: BusinessStatus;
  /** Shown as Verified badge after admin approval */
  verified: boolean;
  notificationEmail: boolean;
  notificationSms: boolean;
  notificationWhatsapp: boolean;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingRecord = {
  id: string;
  businessId: string;
  customerName: string;
  serviceLabel: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
};

export type AnalyticsEventType = "view" | "whatsapp" | "call" | "inquiry";

export type AnalyticsEvent = {
  id: string;
  businessId: string;
  type: AnalyticsEventType;
  ts: string;
};
