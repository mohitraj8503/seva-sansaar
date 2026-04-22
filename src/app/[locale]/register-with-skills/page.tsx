"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ServiceAreaPicker } from "@/components/business/ServiceAreaPicker";
import { SkillsVerificationFlow } from "@/components/skills/SkillsVerificationFlow";
import type { ServiceAreaPlace } from "@/lib/types/owner";
import type { SkillCategory, TestAttempt } from "@/lib/types/skills";
import { writeOwnerSession } from "@/lib/ownerClient";

type RegistrationStep = "basic-info" | "skills-verification" | "confirm";

interface SkillsData {
  skills: SkillCategory[];
  completedTests: TestAttempt[];
  certifications: string[];
}

export default function RegisterWithSkillsPage() {
  const router = useRouter();

  // Registration state
  const [step, setStep] = useState<RegistrationStep>("basic-info");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState<"individual" | "service" | "">("");
  const [name, setName] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState("");
  const [pricing, setPricing] = useState("");
  const [description, setDescription] = useState("");
  const [areas, setAreas] = useState<ServiceAreaPlace[]>([]);
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);

  const businessId = `biz-${Date.now()}`;

  // Step 1: Basic Info Form
  const handleBasicInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!ownerEmail || !password || !name || !phone || !city) {
      setErr("Please fill all required fields");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setStep("skills-verification");
  };

  // Step 2: Skills Verification Complete
  const handleSkillsComplete = (data: {
    businessId: string;
    skills: SkillCategory[];
    completedTests: TestAttempt[];
    certifications: string[];
  }) => {
    setSkillsData({
      skills: data.skills,
      completedTests: data.completedTests,
      certifications: data.certifications,
    });
    setStep("confirm");
  };

  // Step 3: Final Registration
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail,
          password,
          category: businessType,
          name,
          services,
          phone,
          whatsapp: whatsapp || phone,
          address,
          city,
          hours,
          pricing,
          description,
          serviceAreas: areas,
          // New fields
          businessId,
          certifiedSkills: skillsData?.skills || [],
          certificates: skillsData?.certifications || [],
          testResults: skillsData?.completedTests || [],
        }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(data.error ?? "Registration failed. Please try again.");
        return;
      }

      const data = (await res.json()) as { businessId: string; ownerSecret: string; status: string };
      writeOwnerSession({
        businessId: data.businessId,
        ownerSecret: data.ownerSecret,
        email: ownerEmail.trim().toLowerCase(),
      });

      setLoading(false);
      router.replace("/dashboard");
    } catch (error) {
      setLoading(false);
      setErr("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  // STEP 1: BASIC INFO
  if (step === "basic-info") {
    return (
      <main className="min-h-screen bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              Step 1 of 3
            </div>
            <h1 className="text-4xl font-black text-navy">Register Your Service</h1>
            <p className="mt-2 text-gray-600">
              Provide basic information about your service and get certified through practical skill tests
            </p>
          </div>

          <form onSubmit={handleBasicInfoSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">{err}</div>
            )}

            {/* Email & Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Email (Login)
                <input
                  required
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="you@example.com"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Password (min 6 chars)
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>

            {/* Business Type */}
            <label className="text-sm font-semibold text-gray-700">
              Type of Service
              <select
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as "individual" | "service")}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select...</option>
                <option value="individual">Individual Service Provider</option>
                <option value="service">Service Business</option>
              </select>
            </label>

            {/* Name & Contact */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Name
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Your name / Business name"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Phone
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="+91..."
                />
              </label>
            </div>

            {/* Services & Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Services Offered
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="e.g., Plumbing, Repairs, Installation"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                City
                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Your city"
                />
              </label>
            </div>

            {/* Address */}
            <label className="text-sm font-semibold text-gray-700">
              Address
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Street address"
              />
            </label>

            {/* Service Areas */}
            <ServiceAreaPicker value={areas} onChange={setAreas} />

            {/* Additional Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Hours of Operation
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="9 AM - 6 PM"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                WhatsApp (optional)
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Same as phone if not provided"
                />
              </label>
            </div>

            {/* Pricing & Description */}
            <label className="text-sm font-semibold text-gray-700">
              Pricing Structure (optional)
              <input
                type="text"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g., ₹500 onwards"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Tell customers about your expertise and services"
                rows={4}
              />
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700"
            >
              Next: Verify Skills
            </button>
          </form>
        </div>
      </main>
    );
  }

  // STEP 2: SKILLS VERIFICATION
  if (step === "skills-verification") {
    return (
      <SkillsVerificationFlow
        businessId={businessId}
        businessName={name}
        onComplete={handleSkillsComplete}
      />
    );
  }

  // STEP 3: CONFIRMATION
  if (step === "confirm" && skillsData) {
    const passedTests = skillsData.completedTests.filter((t) => t.passed).length;

    return (
      <main className="min-h-screen bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              Step 3 of 3: Confirm & Complete
            </div>
            <h1 className="text-3xl font-black text-navy">Registration Summary</h1>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 space-y-6">
            {/* Business Info Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Business Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{ownerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-semibold text-gray-900">{city}</p>
                </div>
              </div>
            </div>

            {/* Skills Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Certified Skills</h2>
              <div className="grid gap-2">
                {skillsData.completedTests.map((test) => (
                  <div
                    key={test.attemptId}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      test.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <span className="font-semibold capitalize text-gray-900">{test.skillId}</span>
                    <span className={`text-sm font-bold ${test.passed ? "text-green-700" : "text-red-700"}`}>
                      {test.passed ? "✓ Passed" : "✗ Failed"} ({Math.round(test.percentageScore || 0)}%)
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                You have passed {passedTests} out of {skillsData.completedTests.length} skill tests
              </p>
            </div>

            {/* Terms */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                By registering, you confirm that the skills and certifications you&apos;ve claimed are accurate and true.
                False claims may result in account suspension.
              </p>
            </div>

            {/* Error Display */}
            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">{err}</div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStep("skills-verification")}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
