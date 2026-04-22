"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  ShieldCheck, 
  Wrench, 
  MapPin, 
  BadgeCheck, 
  Briefcase,
  Users,
  User,
  Star,
  Zap
} from "lucide-react";
import { ServiceAreaPicker } from "@/components/business/ServiceAreaPicker";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import { writeOwnerSession } from "@/lib/ownerClient";
import { SUPPORTED_CITIES, DEFAULT_CITY } from "@/config/geographic";

const CATEGORIES = [
  { id: "Electrician", label: "Electrician", icon: Wrench },
  { id: "Plumber", label: "Plumber", icon: MapPin },
  { id: "Salon", label: "Salon & Beauty", icon: Star },
  { id: "Cleaning", label: "Cleaning", icon: ShieldCheck },
  { id: "Repair", label: "Appliance Repair", icon: Briefcase },
  { id: "Tutor", label: "Home Tutor", icon: Users },
];

const PACKAGES = [
  { id: "basic", name: "Basic", defaultPrice: 299, desc: "Standard Inspection & Minor tasks" },
  { id: "standard", name: "Standard", defaultPrice: 599, desc: "Deep Repair & Component checks" },
  { id: "premium", name: "Premium", defaultPrice: 999, desc: "Full Servicing & Guaranteed parts" },
];

export default function ListBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 is landing, 1-9 are form steps
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ownerEmail: "",
    password: "",
    name: "",
    phone: "",
    category: "",
    experience: "1-3 Years",
    workType: "Individual",
    address: "",
    locality: "",
    city: DEFAULT_CITY.name,
    hours: "Mon-Sat, 9AM-7PM",
    description: "",
    pricing: "Custom Packages",
    services: "",
    verificationId: "",
  });
  const [areas, setAreas] = useState<ServiceAreaPlace[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [verificationType, setVerificationType] = useState<string>("");

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("seva-registration-draft");
    if (saved) {
      try {
        const { data, step: savedStep, areas: savedAreas, pkg, vType } = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...data }));
        if (savedStep) setStep(savedStep);
        if (savedAreas) setAreas(savedAreas);
        if (pkg) setSelectedPackage(pkg);
        if (vType) setVerificationType(vType);
      } catch (e) {
        console.error("Failed to restore registration draft", e);
      }
    }
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    if (step > 0) {
      localStorage.setItem("seva-registration-draft", JSON.stringify({
        data: formData,
        step,
        areas,
        pkg: selectedPackage,
        vType: verificationType
      }));
    }
  }, [formData, step, areas, selectedPackage, verificationType]);

  // Update formData when selectedPackage changes
  useEffect(() => {
    if (selectedPackage) {
      const pkg = PACKAGES.find(p => p.id === selectedPackage);
      if (pkg) {
        updateField("pricing", `₹${pkg.defaultPrice} - ${pkg.name} Tier`);
      }
    }
  }, [selectedPackage]);

  // Calculate Progress
  const totalSteps = 9;
  const progress = Math.round((step / totalSteps) * 100);

  const updateField = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (pass: string) => {
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= 8 && hasNumber && hasSymbol;
  };

  const validatePhone = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.ownerEmail.includes("@")) {
        setErr("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(formData.password)) {
        setErr("Security Policy: Password must be 8+ chars with at least 1 number and 1 special character.");
        return;
      }
    }
    if (step === 2 && !formData.category) {
      setErr("Select your professional category.");
      return;
    }
    if (step === 3) {
      if (!formData.name) {
        setErr("Business name is required.");
        return;
      }
      if (!validatePhone(formData.phone)) {
        setErr("Enter a valid 10-digit Indian mobile number.");
        return;
      }
    }
    if (step === 6 && !selectedPackage) {
      setErr("Please select a pricing package to continue.");
      return;
    }
    if (step === 7 && (!verificationType || !formData.verificationId)) {
      setErr("Complete verification details to continue.");
      return;
    }
    setErr("");
    setStep(prev => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const clearDraft = () => {
    localStorage.removeItem("seva-registration-draft");
    window.location.reload();
  };

  const onSubmit = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          whatsapp: formData.phone,
          serviceAreas: areas,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Registration failed. Try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      writeOwnerSession({
        businessId: data.businessId,
        ownerSecret: data.ownerSecret,
        email: formData.ownerEmail.trim().toLowerCase(),
      });
      setSubmitted(true);
      setTimeout(() => router.replace("/dashboard"), 3000);
    } catch {
      setErr("Connectivity error. Please check your network.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4">
        <div className="w-full max-w-lg text-center animate-in zoom-in duration-700">
          <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl shadow-emerald-200">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-5xl font-black text-navy uppercase tracking-tighter">Verified Submission</h2>
          <p className="mt-6 text-xl text-gray-400 font-medium leading-relaxed">
            Welcome to the ecosystem! Your profile is now being processed by our trust team. You will start receiving local leads shortly.
          </p>
          <div className="mt-12 rounded-[3.5rem] bg-navy p-10 flex items-center gap-6 text-left shadow-2xl shadow-navy/40">
            <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-white animate-spin shrink-0" />
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-white">Activating Dashboard</p>
              <p className="text-xs font-bold text-white/50">Linking with your professional identity...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB] pb-24 pt-32 selection:bg-navy selection:text-white">
      {/* Progress Bar (Visible from Step 1) */}
      {step > 0 && step < totalSteps && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100">
           <div className="h-1.5 w-full bg-gray-50">
             <div 
               className="h-full bg-gradient-to-r from-navy via-navy to-orange-500 transition-all duration-1000 ease-out-expo" 
               style={{ width: `${progress}%` }}
             />
           </div>
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/40">Onboarding Progress</span>
               <span className="text-xs font-black text-navy">Step 0{step} <span className="text-gray-200">/</span> 08</span>
            </div>
            <button onClick={prevStep} className="group text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-navy flex items-center gap-2 transition-colors">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 relative">
        {step === 0 && (
          <div className="flex flex-col lg:flex-row items-center gap-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out-expo">
            <div className="flex-1 space-y-8">
               <div className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-navy animate-in fade-in zoom-in duration-700 delay-300">
                 <BadgeCheck size={14} className="text-emerald-500" /> Join Jamshedpur&apos;s Elite Pros
               </div>
               <h1 className="text-7xl font-black text-navy leading-[1.05] tracking-tighter animate-in fade-in slide-in-from-left-8 duration-700 delay-500">
                 Your Growth starts <span className="text-saffron italic">here</span>
               </h1>
               <p className="text-xl font-medium text-gray-500 leading-relaxed max-w-xl animate-in fade-in slide-in-from-left-8 duration-700 delay-700">
                 Be part of Bharat&apos;s premium local professional network. Verified leads, instant trust, and digital presence for your brand.
               </p>
               
               <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-700 delay-1000">
                  <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-navy/10 transition-all duration-500">
                     <p className="text-4xl font-black text-navy tracking-tight">0%</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Commission Fees</p>
                  </div>
                  <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-navy/10 transition-all duration-500">
                     <p className="text-4xl font-black text-navy tracking-tight">24h</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Lead Activation</p>
                  </div>
               </div>

               <button 
                 onClick={nextStep}
                 className="flex group h-24 w-full lg:w-96 items-center justify-center gap-4 rounded-[3rem] bg-navy text-sm font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-navy/30 transition-all hover:-translate-y-2 hover:shadow-navy/50 active:scale-95 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[1200ms]"
               >
                 Launch My Profile
                 <ChevronRight size={24} className="transition-transform group-hover:translate-x-3" />
               </button>
            </div>
            
            <div className="flex-1 relative animate-in fade-in zoom-in-90 duration-1000 delay-500">
               <div className="absolute -inset-6 rounded-[5rem] border-2 border-dashed border-navy/5" />
               <div className="relative rounded-[4rem] overflow-hidden shadow-3xl transition-transform duration-1000 hover:scale-[1.02] group">
                  <div className="absolute inset-0 bg-navy/10 hover:bg-transparent transition-colors duration-1000 z-10" />
                  <div className="relative w-full h-[600px]">
                    <Image 
                      src="https://images.pexels.com/photos/8961313/pexels-photo-8961313.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="Professional"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 rounded-[2.5rem] bg-white/20 backdrop-blur-2xl p-8 border border-white/30 z-20">
                     <p className="text-white text-sm font-medium leading-relaxed italic opacity-90">
                       &quot;Joining Seva Sansaar transformed my service approach. I now serve the city&apos;s most premium clients directly.&quot;
                     </p>
                     <p className="mt-4 text-white text-[10px] font-black uppercase tracking-[0.2em]">— AMIT KUMAR, EXPERT PLUMBER</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className={`mx-auto max-w-xl transition-all duration-1000 ease-out-expo ${step === 0 ? "opacity-0 translate-y-16 scale-95 pointer-events-none" : "opacity-100 translate-y-0 scale-100"}`}>
          {step === 1 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Secure Access</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Create Master Account</h3>
                <p className="text-lg font-medium text-gray-400 max-w-md">Your gateway to bookings and payments.</p>
              </div>
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <input
                  placeholder="EMAIL ADDRESS"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => updateField("ownerEmail", e.target.value)}
                  className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all duration-700"
                />
                <input
                  placeholder="PASSWORD (8+ CHARS, 1 NUM, 1 SYMBOL)"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all duration-700"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Specialization</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Expertise Area</h3>
                <p className="text-lg font-medium text-gray-400">Select your primary professional domain.</p>
              </div>
              <div className="grid grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-700 delay-300">
                 {CATEGORIES.map((cat) => (
                   <button
                    key={cat.id}
                    onClick={() => updateField("category", cat.id)}
                    className={`group flex flex-col items-center justify-center gap-6 rounded-[3.5rem] border-2 p-12 transition-all duration-700 ease-out-expo ${
                      formData.category === cat.id 
                      ? "border-navy bg-navy/5 shadow-2xl shadow-navy/20 -translate-y-3" 
                      : "border-gray-50 bg-white hover:border-gray-200 hover:-translate-y-1"
                    }`}
                   >
                     <div className={`p-5 rounded-full shadow-lg transition-all duration-500 ${formData.category === cat.id ? "bg-navy text-white scale-110" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:scale-105"}`}>
                       <cat.icon size={40} strokeWidth={1.5} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-navy lg:whitespace-nowrap">{cat.label}</span>
                   </button>
                 ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Identity</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Brand Detail</h3>
                <p className="text-lg font-medium text-gray-400">Establish your presence on Bharat&apos;s map.</p>
              </div>
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <input
                  placeholder="LEGAL BUSINESS / BRAND NAME"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all"
                />
                <input
                  placeholder="DIRECT WHATSAPP NUMBER"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all"
                />
                
                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-8">Operational City</span>
                      <select 
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="w-full rounded-[2rem] border-2 border-gray-100 bg-white px-8 py-6 text-xs font-black outline-none focus:border-navy uppercase tracking-widest appearance-none transition-all"
                      >
                        {SUPPORTED_CITIES.map(city => (
                          <option key={city.id} value={city.name} disabled={!city.active}>
                            {city.name} {!city.active ? "(COMING SOON)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-8">Years of experience</span>
                     <select 
                       value={formData.experience}
                       onChange={(e) => updateField("experience", e.target.value)}
                       className="w-full rounded-[2rem] border-2 border-gray-100 bg-white px-8 py-6 text-xs font-black outline-none focus:border-navy uppercase tracking-widest appearance-none transition-all"
                     >
                       <option>1-3 YEARS</option>
                       <option>3-5 YEARS</option>
                       <option>5+ YEARS</option>
                       <option>MASTER (10+ YEARS)</option>
                     </select>
                   </div>
                   <div className="space-y-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-8">Structure</span>
                     <select 
                       value={formData.workType}
                       onChange={(e) => updateField("workType", e.target.value)}
                       className="w-full rounded-[2rem] border-2 border-gray-100 bg-white px-8 py-6 text-xs font-black outline-none focus:border-navy uppercase tracking-widest appearance-none transition-all"
                     >
                       <option>SOLO PRO</option>
                       <option>TINY SQUAD (2-4)</option>
                       <option>FULL AGENCY (5+)</option>
                     </select>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Portfolio</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Key Offerings</h3>
                <p className="text-lg font-medium text-gray-400">Define the core tasks you provide.</p>
              </div>
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <textarea
                  placeholder="LIST SERVICES (E.G. BOARD REPAIR, TAP INSTALL, AC SERVICE...)"
                  value={formData.services}
                  onChange={(e) => updateField("services", e.target.value)}
                  className="h-40 w-full rounded-[3rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest leading-relaxed transition-all"
                />
                <textarea
                  placeholder="INTRODUCE YOURSELF TO CUSTOMERS"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="h-40 w-full rounded-[3rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest leading-relaxed transition-all"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Geo Targeting</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Service Radius</h3>
                <p className="text-lg font-medium text-gray-400">Where can customers book you?</p>
              </div>
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                 <input
                    placeholder="HEAD OFFICE / SHOP ADDRESS"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all"
                  />
                  <div className="rounded-[3.5rem] bg-white border-2 border-gray-50 overflow-hidden shadow-3xl transition-all duration-1000">
                    <ServiceAreaPicker value={areas} onChange={setAreas} />
                  </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Revenue Engine</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Monetization</h3>
                <p className="text-lg font-medium text-gray-400">Set clear price points to boost trust.</p>
              </div>
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                 {PACKAGES.map((pkg, idx) => (
                   <button
                     key={pkg.id}
                     onClick={() => setSelectedPackage(pkg.id)}
                     className={`group relative overflow-hidden rounded-[3rem] border-2 bg-white p-12 transition-all duration-700 ease-out-expo hover:shadow-3xl hover:shadow-navy/15 hover:-translate-y-2 active:scale-98 w-full text-left ${
                       selectedPackage === pkg.id
                         ? "border-orange-500 bg-orange-50 shadow-orange-200"
                         : "border-gray-50 hover:border-gray-200"
                     }`}
                     style={{ transitionDelay: `${idx * 100}ms` }}
                   >
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-navy uppercase tracking-tighter italic">{pkg.name} Tier</span>
                            {pkg.id === "standard" && (
                              <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-orange-200">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-navy tracking-tighter">₹{pkg.defaultPrice}</span>
                            <div className={`p-1.5 rounded-full transition-all duration-500 ${selectedPackage === pkg.id ? "bg-orange-500 text-white scale-110" : "bg-gray-100 text-transparent"}`}>
                              <CheckCircle2 size={20} />
                            </div>
                          </div>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{pkg.desc}</p>
                      <div className={`absolute top-0 right-0 h-full w-2.5 transition-colors duration-700 ${
                        selectedPackage === pkg.id ? "bg-orange-500" : "bg-gray-50 group-hover:bg-navy"
                      }`} />
                   </button>
                 ))}
                 <div className="rounded-[3rem] bg-emerald-500/5 p-10 border-2 border-dashed border-emerald-500/20 mt-10">
                    <p className="text-[11px] font-black text-emerald-600 text-center uppercase tracking-[0.25em] leading-relaxed italic">
                       Professional tiers help customers choose faster and value your expertise higher.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Security Vault</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Digital KYS</h3>
                <p className="text-lg font-medium text-gray-400">Encrypted identity verification for pro status.</p>
              </div>

              <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                 <button
                   onClick={() => setVerificationType('selfie')}
                   className={`group relative flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 p-8 transition-all duration-500 ${
                     verificationType === 'selfie' ? 'border-navy bg-navy/5 shadow-2xl' : 'border-gray-50 bg-white hover:border-gray-200'
                   }`}
                 >
                    <div className={`p-5 rounded-full shadow-lg ${verificationType === 'selfie' ? 'bg-navy text-white' : 'bg-gray-50 text-gray-300'}`}>
                       <User size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-navy">FACIAL ID</span>
                 </button>
                 <button
                   onClick={() => setVerificationType('identity')}
                   className={`group relative flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 p-8 transition-all duration-500 ${
                     verificationType === 'identity' ? 'border-navy bg-navy/5 shadow-2xl' : 'border-gray-50 bg-white hover:border-gray-200'
                   }`}
                 >
                    <div className={`p-5 rounded-full shadow-lg ${verificationType === 'identity' ? 'bg-navy text-white' : 'bg-gray-50 text-gray-300'}`}>
                       <ShieldCheck size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-navy">GOVT DOC</span>
                 </button>
              </div>
              
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                 <div className="group relative">
                   <input
                     placeholder={verificationType === 'selfie' ? "ENTER PHONE NUMBER FOR SELFIE LINK" : "ENTER AADHAAR / PAN NUMBER"}
                     value={formData.verificationId || ""}
                     onChange={(e) => updateField("verificationId", e.target.value)}
                     className="w-full rounded-[2.5rem] border-2 border-gray-100 bg-white px-10 py-8 text-xs font-black shadow-sm outline-none focus:border-navy uppercase tracking-widest transition-all"
                   />
                   <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <ShieldCheck size={20} className="text-navy/20" />
                   </div>
                 </div>

                 <div className="group relative flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50 hover:border-navy hover:bg-navy/5 transition-all transition-duration-700">
                    <Loader2 size={24} className="text-gray-300 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">UPLOAD DOCUMENT PHOTO</span>
                 </div>
                 
                 <div className="flex items-center justify-center gap-3 px-8 py-5 bg-emerald-500/5 rounded-full border border-emerald-500/10 self-center mx-auto mt-6">
                    <ShieldCheck className="text-emerald-500" size={18} />
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Digital India Encrypted Node Active</p>
                 </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-10">
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Final Verification</span>
                <h3 className="text-6xl font-black text-navy tracking-tighter italic">Preview Profile</h3>
                <p className="text-lg font-medium text-gray-400">Experience your brand exactly as clients will.</p>
              </div>
              
              <div className="overflow-hidden rounded-[4.5rem] border-2 border-gray-100 bg-white shadow-3xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
                 <div className="h-48 bg-navy relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent" />
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.6em] text-white/40">VERIFIED PROFESSIONAL PORTFOLIO</span>
                 </div>
                 <div className="px-14 pb-16 -mt-24 text-center relative z-10">
                    <div className="mx-auto mb-10 h-48 w-48 rounded-[4rem] bg-gray-50 border-[10px] border-white shadow-3xl flex items-center justify-center relative group overflow-hidden">
                       <User size={64} className="text-gray-200 group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-5xl font-black text-navy tracking-tighter leading-none">{formData.name || "UNNAMED BRAND"}</h4>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-saffron/10 px-4 py-1.5 text-[10px] font-black text-saffron uppercase tracking-[0.1em] italic">
                       <Zap size={14} fill="currentColor" /> {formData.category}
                    </div>
                    
                    <div className="mt-14 grid grid-cols-2 gap-6 text-left">
                       <div className="rounded-[2.75rem] bg-gray-50/70 p-10 border border-gray-100/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">CORE SERVICES</p>
                          <p className="text-xs font-black text-navy leading-loose tracking-tight whitespace-pre-wrap">{formData.services || "PENDING..."}</p>
                       </div>
                       <div className="rounded-[2.75rem] bg-gray-50/70 p-10 border border-gray-100/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">EXPERIENCE</p>
                          <p className="text-sm font-black text-navy uppercase italic tracking-tighter">{formData.experience}</p>
                          <div className="mt-8 pt-6 border-t border-gray-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">OPERATING IN</p>
                             <p className="text-xs font-black text-navy tracking-tight">{areas.length || "ALL"} LOCAL AREAS</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          {step !== 0 && (
            <div className="mt-20 flex flex-col gap-6">
              {err && (
                <div className="animate-in shake duration-500 rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center justify-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">CRITICAL ERROR: {err}</p>
                </div>
              )}
              <button
                onClick={step === 8 ? onSubmit : nextStep}
                disabled={loading || (step === 6 && !selectedPackage)}
                className="relative group flex h-28 w-full items-center justify-center gap-6 rounded-[3.5rem] bg-navy text-sm font-black uppercase tracking-[0.45em] text-white shadow-[0_45px_100px_-20px_rgba(26,45,92,0.6)] transition-all duration-1000 ease-out-expo hover:-translate-y-3 hover:shadow-[0_60px_120px_-25px_rgba(26,45,92,0.7)] active:scale-95 disabled:opacity-40 overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={32} strokeWidth={3} />
                ) : (
                  <>
                    <span className="relative z-10">{step === 8 ? "GO LIVE NOW" : "CONTINUE FLOW"}</span>
                    <ChevronRight size={24} className="relative z-10 transition-transform group-hover:translate-x-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms]" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-10">
                 <button onClick={clearDraft} className="text-[9px] font-black text-gray-300 uppercase underline tracking-[0.2em] hover:text-red-500 transition-colors">Start Fresh (Clear Progress)</button>
                 <div className="h-px w-20 bg-gray-400 opacity-30" />
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] opacity-30">SECURE BHARAT STACK</p>
                 <div className="h-px w-20 bg-gray-400 opacity-30" />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
