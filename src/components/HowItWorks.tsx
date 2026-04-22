"use client";

import { useInView } from "@/hooks/useAnimations";
import { Search, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Service",
    desc: "Search for specific services or browse curated categories tailored to your city.",
    color: "bg-saffron/10 text-saffron",
  },
  {
    icon: ShieldCheck,
    title: "Verify & Compare",
    desc: "View government-verified badges, ratings, and work history to ensure absolute trust.",
    color: "bg-india-green/10 text-india-green",
  },
  {
    icon: Zap,
    title: "Connect Instantly",
    desc: "Connect via WhatsApp or direct call with zero middleman interference or platform fees.",
    color: "bg-navy/10 text-navy",
  },
];

export default function HowItWorks() {
  const { ref, isVisible } = useInView();

  return (
    <section className="bg-white py-32 border-t border-gray-100" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-navy/40 mb-4">
            The Digital Public Infrastructure
          </h2>
          <h3 className="text-4xl font-black text-navy sm:text-5xl tracking-tight">
            How Seva Sansaar Works
          </h3>
          <p className="mt-6 text-gray-500 text-lg font-medium leading-relaxed">
            Eliminating information asymmetry by bringing trusted local services onto one unified public platform.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-16 relative stagger ${
            isVisible ? "visible" : ""
          }`}
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-gray-100 -z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="group relative flex flex-col items-center text-center">
                <div className={`relative z-10 w-32 h-32 rounded-[2.5rem] flex items-center justify-center ${step.color} mb-8 shadow-premium-md transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-elevated outline outline-4 outline-white`}>
                  <Icon size={40} />
                  <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-navy shadow-premium-sm border border-gray-100">
                    0{index + 1}
                  </div>
                </div>
                
                <h4 className="text-2xl font-black text-navy mb-4 group-hover:text-saffron transition-colors">
                  {step.title}
                </h4>
                <p className="text-gray-500 text-base font-medium leading-relaxed max-w-[280px]">
                  {step.desc}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-8 text-gray-200 hidden md:block">
                     <ArrowRight size={24} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

