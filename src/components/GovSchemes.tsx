import { Building2, Globe, Landmark, ShieldCheck } from "lucide-react";

const items = [
  { icon: Landmark, label: "Digital India", desc: "Digital transformation architecture", accent: "bg-[#FF9933]/10" },
  { icon: ShieldCheck, label: "PM Vishwakarma", desc: "Technical skill development", accent: "bg-[#138808]/10" },
  { icon: Building2, label: "Smart Cities", desc: "Urban infrastructure program", accent: "bg-[#000080]/10" },
  { icon: Globe, label: "ONDC", desc: "Unified digital marketplace", accent: "bg-navy/5" },
];

export default function GovSchemes() {
  return (
    <section className="relative bg-[#fafaf9] py-16 md:py-24 overflow-hidden border-y border-gray-100">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1a2d5c 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6 border border-gray-100">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a2d5c]">Strategic Alignment</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tight leading-tight mb-4">
            Government <span className="italic font-serif font-light text-navy/80">Affiliated</span>
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Seva Sansaar operates within India&apos;s digital infrastructure guidelines, leveraging flagship transformation protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(({ icon: Icon, label, desc, accent }, index) => (
            <div
              key={label}
              className="group relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 h-full">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${accent} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-navy" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-navy text-lg uppercase tracking-tight mb-2">{label}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Seal Badge */}
        <div className="flex justify-center mt-12 md:mt-20">
          <div className="group relative">
            <div className="relative flex items-center gap-3 md:gap-4 px-6 md:px-10 py-4 md:py-6 bg-navy text-white rounded-2xl md:rounded-3xl shadow-lg transition-transform hover:-translate-y-1">
              <div className="p-1.5 md:p-2 bg-white/10 rounded-xl">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-[#138808]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Official Protocol</span>
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">Government Recognized Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
