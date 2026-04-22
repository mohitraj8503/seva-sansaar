import { Link } from "@/i18n/navigation";
import { ExternalLink, Briefcase, Zap, ShieldCheck } from "lucide-react";

export default function ListBusinessCTA() {
  return (
    <section id="list-business" className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-navy rounded-3xl shadow-xl overflow-hidden">
          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-[#FF9933] to-transparent" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 sm:mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Partnership Opportunity</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 sm:mb-6">
              Empowering India&apos;s <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Digital Workforce.</span>
            </h2>
            
            <p className="mx-auto max-w-2xl text-sm md:text-base font-medium text-white/50 leading-relaxed mb-10 sm:mb-12">
              Join a network of 5,000+ verified technical experts. Leverage India&apos;s most advanced decentralized service infrastructure with zero commission overheads.
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
              {[
                { label: "Verified Leads", icon: ShieldCheck },
                { label: "Direct Income", icon: Zap },
                { label: "Enterprise Support", icon: Briefcase }
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <pill.icon className="h-4 w-4 text-[#FF9933]" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">{pill.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/list-business"
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-white text-navy rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Start Verification →
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF9933] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl" />
              </Link>
              
              <Link
                href="/list-business"
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Technical Protocol
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
