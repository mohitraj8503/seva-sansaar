"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Star,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { CONTACT } from "@/lib/constants";

type Business = {
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  price: string;
  priceRange: string;
  verified: boolean;
  vishwakarma: boolean;
  image: string;
  locality: string;
  hours: string;
  description: string;
  pricingTiers?: { name: string; price: number; features: string[]; popular?: boolean }[];
};

const businesses: Business[] = [
  {
    slug: "steel-city-electric-sakchi",
    name: "Steel City Electricals",
    category: "Electrician",
    categoryId: "electrician",
    rating: 4.8,
    reviewCount: 124,
    price: "₹499",
    priceRange: "₹299 - ₹1,499",
    verified: true,
    vishwakarma: true,
    image: "https://images.pexels.com/photos/21812143/pexels-photo-21812143.jpeg",
    locality: "Sakchi, Jamshedpur",
    hours: "9 AM - 8 PM",
    description: "Licensed electrician with 12+ years experience in residential and commercial wiring.",
    pricingTiers: [
      { name: "Basic", price: 499, features: ["Switch Repair", "Fuse Check", "15-min visit"] },
      { name: "Standard", price: 899, features: ["Wiring Check", "Mains Board", "1hr support"], popular: true },
      { name: "Premium", price: 1499, features: ["Full Audit", "Safety Gear", "Lifetime Warranty"] },
    ],
  },
  {
    slug: "adityapur-home-tutors",
    name: "Adityapur Home Tutors",
    category: "Home Tutor",
    categoryId: "tutor",
    rating: 4.9,
    reviewCount: 89,
    price: "₹599",
    priceRange: "₹299 - ₹4,999",
    verified: true,
    vishwakarma: false,
    image: "https://images.pexels.com/photos/4308096/pexels-photo-4308096.jpeg",
    locality: "Adityapur, Jamshedpur",
    hours: "10 AM - 7 PM",
    description: "Experienced tutors for all subjects from Class 1-12. Home visits available.",
    pricingTiers: [
      { name: "Demo Class", price: 299, features: ["1 Hour Demo", "Syllabus Plan", "Level Test"] },
      { name: "Per Session", price: 599, features: ["2 Hours Session", "Notes PDF", "Q&A Session"], popular: true },
      { name: "Monthly", price: 4999, features: ["20 Sessions", "Test Series", "Progress Report"] },
    ],
  },
  {
    slug: "mango-glow-salon",
    name: "Mango Glow Salon",
    category: "Salon & Beauty",
    categoryId: "salon",
    rating: 4.9,
    reviewCount: 215,
    price: "₹350",
    priceRange: "₹200 - ₹2,999",
    verified: true,
    vishwakarma: true,
    image: "https://images.pexels.com/photos/12584801/pexels-photo-12584801.jpeg",
    locality: "Mango, Jamshedpur",
    hours: "10 AM - 9 PM",
    description: "Premium salon with expert stylists. Bridal packages and daily grooming services.",
    pricingTiers: [
      { name: "Essential", price: 350, features: ["Haircut", "Head Massage", "Refreshment"] },
      { name: "Glow Up", price: 899, features: ["Facial", "Clean Up", "Skin Consultancy"], popular: true },
      { name: "Bridal", price: 2999, features: ["Full Makeup", "Styling", "VIP Lounge"] },
    ],
  },
  {
    slug: "jamshedpur-expert-plumbers",
    name: "Jamsheduru Plumber Experts",
    category: "Plumber",
    categoryId: "plumber",
    rating: 4.7,
    reviewCount: 98,
    price: "₹300",
    priceRange: "₹200 - ₹2,500",
    verified: true,
    vishwakarma: false,
    image: "https://images.pexels.com/photos/8961313/pexels-photo-8961313.jpeg",
    locality: "Bistupur, Jamshedpur",
    hours: "8 AM - 7 PM",
    description: "Fast response plumber for leaks, fittings, and full bathroom installations.",
    pricingTiers: [
      { name: "Checkup", price: 300, features: ["Leak Identification", "Pressure Check", "15min Job"] },
      { name: "Repair", price: 750, features: ["Pipe Repair", "Tap Install", "1hr Guarantee"], popular: true },
      { name: "Full Install", price: 2500, features: ["Bathroom Setup", "Drain Fix", "Warranty"] },
    ],
  },
  {
    slug: "clean-city-services",
    name: "Clean City Services",
    category: "Cleaning",
    categoryId: "cleaning",
    rating: 4.6,
    reviewCount: 67,
    price: "₹800",
    priceRange: "₹500 - ₹4,500",
    verified: true,
    vishwakarma: false,
    image: "https://images.pexels.com/photos/17697365/pexels-photo-17697365.jpeg",
    locality: "Sonari, Jamshedpur",
    hours: "7 AM - 6 PM",
    description: "Professional deep cleaning for homes, offices, and commercial spaces.",
    pricingTiers: [
      { name: "Room Only", price: 800, features: ["Deep Clean", "Sanitization", "Window Wash"] },
      { name: "Full Home", price: 2500, features: ["Kitchen & Bath", "Floor Polish", "Eco Products"], popular: true },
      { name: "Premium", price: 4500, features: ["Complete Detail", "Furniture Wax", "Pest Control"] },
    ],
  },
  {
    slug: "bistupur-appliance-repair",
    name: "Bistupur Appliance Care",
    category: "Appliance Repair",
    categoryId: "appliance",
    rating: 4.5,
    reviewCount: 53,
    price: "₹399",
    priceRange: "₹299 - ₹1,999",
    verified: true,
    vishwakarma: true,
    image: "https://images.pexels.com/photos/5848044/pexels-photo-5848044.jpeg",
    locality: "Bistupur, Jamshedpur",
    hours: "9 AM - 8 PM",
    description: "AC, fridge, washing machine & microwave repair by certified technicians.",
    pricingTiers: [
      { name: "Diagnosis", price: 399, features: ["Problem Check", "Quote Given", "No Fix No Fee"] },
      { name: "Standard Repair", price: 999, features: ["Parts + Labour", "30-day Warranty"], popular: true },
      { name: "Annual AMC", price: 3999, features: ["4 Visits/Year", "Priority Support", "10% Off Parts"] },
    ],
  },
];

export default function FeaturedBusinesses({ activeCategory }: { activeCategory?: string }) {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

  const filtered =
    !activeCategory || activeCategory === "all"
      ? businesses
      : businesses.filter((b) => b.categoryId === activeCategory);

  return (
    <section id="featured" className="bg-seva-offwhite py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="relative section-minimal-inner">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-saffron">
              Featured Professionals
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy">
              {activeCategory && activeCategory !== "all"
                ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Experts`
                : "Trusted Experts Near You"}
            </h2>
            <p className="text-base text-gray-500 font-medium">
              {filtered.length} verified professionals ready to help
            </p>
          </div>
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy bg-navy/5 px-6 py-3 rounded-full transition-colors hover:bg-navy/10"
          >
            <span>See all experts</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
        </div>

        {/* Business Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b, index) => (
              <button
                key={b.slug}
                onClick={() => setSelectedBiz(b)}
                className="group text-left rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-premium-sm transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                aria-label={`View details for ${b.name}, ${b.category}, rated ${b.rating} out of 5`}
              >
                {/* Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={b.image}
                    alt={`${b.name} - ${b.category} services`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                    quality={80}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <VerificationBadge verified={b.verified} />
                    {b.vishwakarma && (
                      <span className="rounded-full bg-india-green px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        PM Vishwakarma
                      </span>
                    )}
                  </div>

                  {/* Quick action overlay */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <div className="rounded-full bg-white p-2.5 shadow-lg">
                      <ChevronRight className="h-5 w-5 text-navy" aria-hidden />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-saffron">
                      {b.category}
                    </span>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden />
                      <span className="text-xs font-bold text-gray-900">{b.rating}</span>
                      <span className="text-[10px] text-gray-400">({b.reviewCount})</span>
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-navy leading-tight">{b.name}</h3>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {b.locality}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      {b.hours}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        From {b.price}
                      </p>
                      <p className="text-[10px] text-gray-300">{b.priceRange}</p>
                    </div>
                    <div className="rounded-full bg-navy p-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Zap className="h-4 w-4 fill-white" aria-hidden />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${activeCategory} experts nearby`}
            description="We're onboarding more professionals in your area. Check back soon or broaden your search."
            action={
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-dark"
              >
                <span>Browse All Services</span>
                <ArrowRight size={16} aria-hidden />
              </Link>
            }
          />
        )}
      </div>

      {/* --- Service Detail Modal --- */}
      <Modal
        open={!!selectedBiz}
        onClose={() => setSelectedBiz(null)}
        size="xl"
        className="overflow-hidden"
      >
        {selectedBiz && (
          <div className="grid md:grid-cols-2">
            {/* Left: Image */}
            <div className="relative h-[300px] md:h-[600px]">
              <Image
                src={selectedBiz.image}
                alt={selectedBiz.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                <div className="flex gap-2 mb-3">
                  <VerificationBadge verified={selectedBiz.verified} />
                  {selectedBiz.vishwakarma && (
                    <span className="rounded-full bg-india-green px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      PM Vishwakarma
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{selectedBiz.name}</h2>
                <p className="mt-1 text-sm font-medium text-white/80">{selectedBiz.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {selectedBiz.locality}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden />
                    {selectedBiz.hours}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="text-sm font-bold">{selectedBiz.rating}</span>
                    <span className="text-xs text-white/60">({selectedBiz.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details & Pricing */}
            <div className="p-6 md:p-8 flex flex-col max-h-[500px] md:max-h-[600px] overflow-y-auto">
              {/* Contact Buttons */}
              <div className="flex gap-3 mb-6">
                <a
                  href={`tel:+91${CONTACT.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-bold text-white transition hover:bg-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call Now
                </a>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-india-green py-3 text-sm font-bold text-white transition hover:bg-india-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>

              {/* Pricing Tiers */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-4">
                Service Packages
              </h3>

              <div className="space-y-4 flex-1">
                {selectedBiz.pricingTiers?.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative flex flex-col gap-3 rounded-2xl border-2 p-5 transition-all hover:border-saffron/50 hover:bg-saffron/5 ${
                      tier.popular ? "border-saffron bg-saffron/5" : "border-gray-100"
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-saffron px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-navy">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {tier.name}
                      </span>
                      <span className="text-xl font-black text-navy">₹{tier.price}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500"
                        >
                          <Check
                            size={14}
                            className="text-india-green shrink-0"
                            aria-hidden
                          />{" "}
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`https://wa.me/${CONTACT.whatsapp}?text=Hi, I'd like to book the ${tier.name} package (${selectedBiz.name}) for ₹${tier.price}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-navy py-3 text-sm font-bold text-white transition hover:bg-navy-dark active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <span>Book via WhatsApp</span>
                      <ExternalLink size={14} aria-hidden />
                    </a>
                  </div>
                ))}
              </div>

              <p className="mt-4 flex items-center gap-1.5 justify-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-india-green" aria-hidden />
                Verified & trusted professionals
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
