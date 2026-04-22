import { IndianRupee, MapPin, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Govt Verified",
    body: "DigiLocker-checked technical proficiency",
    accent: "from-emerald-500/20 to-transparent"
  },
  {
    icon: IndianRupee,
    title: "Zero Commission",
    body: "Transparent marketplace infrastructure",
    accent: "from-orange-500/20 to-transparent"
  },
  {
    icon: MapPin,
    title: "Precision Locality",
    body: "Distance-optimized provider discovery",
    accent: "from-blue-500/20 to-transparent"
  },
  {
    icon: Zap,
    title: "Direct Access",
    body: "Zero-latency expert communication",
    accent: "from-purple-500/20 to-transparent"
  },
] as const;

export default function WhySevaSansaar() {
  return (
    <section className="bg-navy py-16 md:py-24 overflow-hidden relative">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/60">
              Citizens Choice
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Inherent <span className="text-[#FF9933]">Trust</span>.
            </h2>
          </div>
          <p className="text-sm md:text-base text-white/50 max-w-sm leading-relaxed font-medium">
            Architected for transparency, Seva Sansaar eliminates middle-layers to connect users with verified Bharat-tech talent.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body, accent }, i) => (
            <div key={title} className="group relative" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="relative h-full flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 transition-all duration-300 hover:bg-white/10 overflow-hidden">
                {/* Dynamic Accent Glow (simplified) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-white uppercase tracking-tight">{title}</h3>
                  <div className="mt-4 h-px w-6 bg-white/20 group-hover:w-12 transition-all duration-300" />
                  <p className="mt-4 sm:mt-5 text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-wider leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
