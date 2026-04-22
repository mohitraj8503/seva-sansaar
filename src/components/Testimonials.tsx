import Image from "next/image";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sunita Devi",
    location: "Jamshedpur",
    quote: "I found a verified electrician in minutes. The transparency in pricing and direct access is unmatched in Bharat tech.",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    initial: "S"
  },
  {
    name: "Imran Khan",
    location: "Ranchi",
    quote: "Working directly with the specialist allowed for a more efficient repair. A truly decentralized service experience.",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    initial: "I"
  },
  {
    name: "Meera Iyer",
    location: "Bhopal",
    quote: "The interface is intuitive enough for all generations. My parents can now hire home help without assistance.",
    image: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg",
    initial: "M"
  },
];

function Stars() {
  return (
    <div className="flex gap-1 mb-2" aria-label="5 stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={8} className="fill-[#FF9933] text-[#FF9933]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#fafafc] py-16 md:py-24 overflow-hidden border-t border-gray-100/50">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm mb-6 border border-gray-100">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9933]">Verified Sentiments</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy leading-tight mb-4">
            नागरिकों की <span className="italic font-serif font-light text-navy/70">आवाज़</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 relative z-10">
          {testimonials.map((item, i) => (
            <div key={item.name} className="group relative" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-full relative flex flex-col p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1">
                
                <div className="relative z-10 mb-8">
                  <Quote className="h-8 w-8 text-navy/5 transition-colors group-hover:text-[#FF9933]/20 mb-4" />
                  <blockquote className="flex-1">
                    <p className="text-base md:text-lg font-medium leading-[1.6] text-navy/80 tracking-tight">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </blockquote>
                </div>
                
                <div className="relative z-10 mt-auto flex items-center gap-4">
                  <div className="relative h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-2xl shadow-sm border border-gray-50 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={item.image}
                      alt={`Review by ${item.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 48px, 56px"
                      priority={i === 0}
                      quality={75}
                    />
                  </div>
                  <div>
                    <Stars />
                    <p className="text-sm md:text-base font-bold text-navy leading-none mb-1.5">{item.name}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
