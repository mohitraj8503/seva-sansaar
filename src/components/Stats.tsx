import { Building2, BadgeCheck, Wrench, Star } from "lucide-react";

const stats = [
  { value: "100+", label: "Cities covered", icon: Building2, color: "text-blue-600" },
  { value: "5,000+", label: "Verified Experts", icon: BadgeCheck, color: "text-emerald-600" },
  { value: "50,000+", label: "Tasks Done", icon: Wrench, color: "text-orange-600" },
  { value: "4.8", label: "Average Rating", icon: Star, color: "text-amber-500", suffix: "★" },
];

export default function Stats() {
  return (
    <section id="stats" className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">Platform Metrics</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tight leading-tight mb-4">
            Scale of <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-[#415e9c]">Reliability</span>
          </h2>
          <p className="max-w-2xl text-gray-500 text-sm md:text-base font-medium leading-relaxed">
            Every transaction is backed by verified certifications and real-time skill assessments, ensuring a zero-compromise service standard.
          </p>
        </div>

        <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {stats.map((s) => (
              <div
                key={s.label}

                className="relative p-8 md:p-10 transition-colors duration-300 hover:bg-gray-50/50"
              >
                {/* Icon Container */}
                <div className="mb-6 text-gray-400">
                  <s.icon size={28} strokeWidth={1.5} className="text-navy/50" />
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1 mb-2">
                  <div className="text-4xl md:text-5xl font-black tabular-nums text-navy tracking-tight">
                    {s.value}
                  </div>
                  {s.suffix && (
                    <span className="text-xl font-black text-amber-500">{s.suffix}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex items-center gap-3">
                  <div className="h-px w-4 bg-navy/20" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
