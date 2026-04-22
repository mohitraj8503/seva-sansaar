/**
 * A10 – Data Migration Script
 * Migrates mock businessData.ts into Firestore.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/seed-businesses.ts
 *
 * Prerequisites:
 *  - Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 *    FIREBASE_ADMIN_PRIVATE_KEY in your shell or .env.local
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as admin from 'firebase-admin';

// ——— Inline mock data (mirrors src/lib/businessData.ts) ——————————

interface SeedBusiness {
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
  image: string;
  description: string;
  services: string[];
  serviceAreas: string[];
  hours: string;
  lat?: number;
  lng?: number;
}

const businesses: SeedBusiness[] = [
  {
    slug: "steel-city-electric-sakchi",
    name: "Steel City Electricals",
    category: "Electrician",
    locality: "Sakchi",
    city: "Jamshedpur",
    lat: 22.8051,
    lng: 86.2024,
    rating: 4.8,
    reviews: 124,
    distanceKm: 0,
    priceRange: "₹400-900",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    verified: true,
    vishwakarma: true,
    image: "https://images.pexels.com/photos/21812143/pexels-photo-21812143.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Licensed electricians for home wiring, MCB faults, and appliance installation across central Jamshedpur.",
    services: ["Wiring", "MCB Repair", "Earthing", "Inverter"],
    serviceAreas: ["Sakchi", "Bistupur", "Golmuri"],
    hours: "Mon-Sat, 8:00 AM - 8:00 PM",
  },
  {
    slug: "adityapur-home-tutors",
    name: "Adityapur Home Tutors",
    category: "Tutor",
    locality: "Adityapur",
    city: "Jamshedpur",
    lat: 22.7765,
    lng: 86.1582,
    rating: 4.9,
    reviews: 89,
    distanceKm: 0,
    priceRange: "₹600-1,400",
    phone: "+91 91234 56789",
    whatsapp: "919123456789",
    verified: true,
    vishwakarma: false,
    image: "https://images.pexels.com/photos/4308096/pexels-photo-4308096.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "CBSE / ICSE / state board tutoring with bilingual support for Adityapur and nearby industrial townships.",
    services: ["Math", "Science", "Board prep", "Class 6-12"],
    serviceAreas: ["Adityapur", "Gamharia", "Kandra"],
    hours: "Daily, 7:00 AM - 9:00 PM",
  },
  {
    slug: "gamharia-cooling-repair",
    name: "Gamharia Cooling & Repair",
    category: "Repair",
    locality: "Gamharia",
    city: "Jamshedpur",
    lat: 22.852,
    lng: 86.275,
    rating: 4.4,
    reviews: 18,
    distanceKm: 0,
    priceRange: "₹500-1,100",
    phone: "+91 99887 77665",
    whatsapp: "919988777665",
    verified: true,
    vishwakarma: true,
    image: "https://images.pexels.com/photos/33755641/pexels-photo-33755641.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "AC, fridge, and industrial cooler repair — same-day slots toward Gamharia and northern corridors.",
    services: ["AC Service", "Gas refill", "Fridge", "Cooler"],
    serviceAreas: ["Gamharia", "Adityapur", "Kandra"],
    hours: "Mon-Sun, 9:00 AM - 10:00 PM",
  },
  {
    slug: "mango-glow-salon",
    name: "Mango Glow Salon",
    category: "Salon",
    locality: "Mango",
    city: "Jamshedpur",
    lat: 22.7978,
    lng: 86.2152,
    rating: 4.95,
    reviews: 210,
    distanceKm: 0,
    priceRange: "₹350-2,200",
    phone: "+91 93456 78123",
    whatsapp: "919345678123",
    verified: true,
    vishwakarma: false,
    image: "https://images.pexels.com/photos/12584801/pexels-photo-12584801.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Premium salon and grooming services for women and men; home-service slots in Mango and Kadma.",
    services: ["Hair", "Bridal", "Skin care", "Home visit"],
    serviceAreas: ["Mango", "Kadma", "Sonari"],
    hours: "Daily, 10:00 AM - 9:00 PM",
  },
];

// ——— Admin SDK Init ———————————————————————————————

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = admin.firestore();

// ——— Seed ———————————————————————————————————————————

async function seedBusinesses() {
  const batch  = db.batch();
  const now    = new Date().toISOString();
  let   count  = 0;

  for (const biz of businesses) {
    // Use slug as Firestore doc ID for easy lookup
    const ref = db.collection('businesses').doc(biz.slug);
    const existing = await ref.get();

    if (existing.exists) {
      console.log(`⚠️  Skipping existing document: ${biz.slug}`);
      continue;
    }

    batch.set(ref, { ...biz, createdAt: now, updatedAt: now });
    count++;
    console.log(`✅ Queued: ${biz.name}`);
  }

  if (count > 0) {
    await batch.commit();
    console.log(`\n🚀 Successfully seeded ${count} businesses into Firestore.`);
  } else {
    console.log('\nℹ️  No new businesses to seed (all already exist).');
  }
}

seedBusinesses().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
