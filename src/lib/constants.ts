/**
 * Shared constants used across the entire application.
 * Centralizes values that were previously hardcoded in multiple components.
 */

// ——— Supported cities ———————————————————————————————————
export const CATEGORIES = [
  { id: "all", label: "All", icon: "Grid3X3" },
  { id: "electrician", label: "Electrician", icon: "Zap" },
  { id: "plumber", label: "Plumber", icon: "Wrench" },
  { id: "tutor", label: "Home Tutor", icon: "BookOpen" },
  { id: "salon", label: "Salon & Beauty", icon: "Scissors" },
  { id: "appliance", label: "Appliance Repair", icon: "Settings" },
  { id: "cleaning", label: "Cleaning", icon: "Sparkles" },
  { id: "repair", label: "Repair", icon: "Hammer" },
  { id: "grocery", label: "Grocery", icon: "ShoppingCart" },
  { id: "painting", label: "Painting", icon: "Palette" },
  { id: "carpentry", label: "Carpentry", icon: "TreePine" },
  { id: "driving", label: "Driving School", icon: "Car" },
  { id: "photography", label: "Photography", icon: "Camera" },
  { id: "catering", label: "Catering", icon: "UtensilsCrossed" },
  { id: "tailoring", label: "Tailoring", icon: "ScissorsLineDashed" },
] as const;

export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);

// ——— Booking time slots ——————————————————————————————
export const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
];

// ——— Service packages (default) ————————————————————
export const SERVICE_PACKAGES = [
  {
    id: "basic",
    name: "Basic Visit",
    price: 299,
    features: ["Diagnosis only", "30-min visit", "No parts included"],
  },
  {
    id: "standard",
    name: "Standard Service",
    price: 599,
    features: ["Diagnosis + Fix", "Up to 1 hour", "Basic parts included"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Package",
    price: 999,
    features: ["Full service", "Up to 2 hours", "All parts included", "7-day warranty"],
  },
];

// ——— Image URLs (use local fallbacks where possible) ———
export const PLACEHOLDER_IMAGE = "/images/placeholder-business.jpg";
export const HERO_VIDEO_URL =
  "https://cdn.pixabay.com/video/2020/05/25/40130-424930038_large.mp4";
export const HERO_POSTER_URL =
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920";

// ——— Contact info (move to env vars in production) ———
export const CONTACT = {
  phone: process.env.CONTACT_PHONE || "7654212171",
  email: process.env.CONTACT_EMAIL || "mohitraj8503@gmail.com",
  whatsapp: process.env.CONTACT_WHATSAPP || "917654212171",
};

// ——— Social links ————————————————————————————————————
export const SOCIAL_LINKS = {
  instagram: process.env.SOCIAL_INSTAGRAM || "#",
  linkedin: process.env.SOCIAL_LINKEDIN || "#",
  twitter: process.env.SOCIAL_TWITTER || "#",
};

// —── App store links —————————————————————————————————
export const APP_STORE_LINKS = {
  ios: process.env.APP_STORE_URL || "#",
  android: process.env.PLAY_STORE_URL || "#",
};

// ——— Payment —————————————————————————————————————————
export const PAYMENT = {
  razorpayUsername: process.env.RAZORPAY_USERNAME || "techtomorrow",
};

// ——— Password policy ————————————————————————————————
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
export const PASSWORD_REQUIREMENTS = "Minimum 8 characters, at least 1 number and 1 special character";

// ——— Review limits ————————————————————————————————
export const REVIEW_MAX_COMMENT_LENGTH = 2000;

// ——— Skills test ———————————————————————————————————
export const SKILLS_PASS_PERCENTAGE = 70;
export const SKILLS_TEST_DURATION_MINUTES = 15;
export const SKILLS_MAX_ATTEMPTS_PER_MONTH = 5;

// ——— Map defaults ———————————————————————————————————
export const DEFAULT_CITY = "Jamshedpur";
export const DEFAULT_CITY_CENTER = { lat: 22.8046, lng: 86.2029 };
export const MAP_ZOOM_DEFAULT = 13;

// ——— Locality list for Jamshedpur ———————————————————
export const JAMSHEDPUR_LOCALITIES = [
  "Sakchi",
  "Bistupur",
  "Telco",
  "Mango",
  "Sonari",
  "Kadma",
  "Golmuri",
  "Jugsalai",
  "Dimna",
  "Govindpur",
  "Adityapur",
  "Gamharia",
  "Surjamda",
  "Hesal",
  "Seraikela",
];

// ——— SEO —————————————————————————————————————————————
export const SITE_URL = "https://sevasansaar.live";
export const SITE_NAME = "Seva Sansaar";
export const SITE_TAGLINE = "Bharat's Digital Service Infrastructure";
