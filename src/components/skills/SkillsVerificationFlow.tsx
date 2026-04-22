"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { SkillsSelection } from "@/components/skills/SkillsSelection";
import { TestQuestionnaire } from "@/components/skills/TestQuestionnaire";
import type { SkillCategory, TestAttempt } from "@/lib/types/skills";
import { skillTests } from "@/lib/skillsTestData";

interface SkillsVerificationFlowProps {
  businessId: string;
  businessName: string;
  onComplete: (data: {
    businessId: string;
    skills: SkillCategory[];
    completedTests: TestAttempt[];
    certifications: string[];
  }) => void;
}

type FlowStep = "select-skills" | "take-tests" | "complete";

interface TestProgress {
  skillId: SkillCategory;
  completed: boolean;
  passed: boolean;
  score?: number;
}

export function SkillsVerificationFlow({
  businessId,
  businessName,
  onComplete,
}: SkillsVerificationFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FlowStep>("select-skills");
  const [selectedSkills, setSelectedSkills] = useState<SkillCategory[]>([]);
  const [testProgress, setTestProgress] = useState<TestProgress[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [completedTests, setCompletedTests] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSkillsSelected = (skills: SkillCategory[]) => {
    setSelectedSkills(skills);
    // Initialize test progress
    const progress = skills.map((skill) => ({
      skillId: skill,
      completed: false,
      passed: false,
    }));
    setTestProgress(progress);
    setCurrentStep("take-tests");
  };

  const handleTestComplete = async (attempt: TestAttempt) => {
    setLoading(true);
    try {
      // Save test attempt to backend
      const res = await fetch("/api/skills/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt),
      });

      if (!res.ok) throw new Error("Failed to save test");

      await res.json();

      // Update progress
      const newProgress = [...testProgress];
      newProgress[currentTestIndex].completed = true;
      newProgress[currentTestIndex].passed = attempt.passed || false;
      newProgress[currentTestIndex].score = attempt.percentageScore || 0;
      setTestProgress(newProgress);

      // Add to completed tests
      setCompletedTests([...completedTests, attempt]);

      // Move to next test or complete
      if (currentTestIndex < selectedSkills.length - 1) {
        setCurrentTestIndex(currentTestIndex + 1);
      } else {
        // All tests completed
        setCurrentStep("complete");
      }
    } catch (error) {
      console.error("Error saving test:", error);
      alert("Failed to save test result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRegistration = async () => {
    // Get all certificates
    const certificates = completedTests
      .filter((t) => t.passed && t.certificateId)
      .map((t) => t.certificateId as string);

    // Call the onComplete callback
    onComplete({
      businessId,
      skills: selectedSkills,
      completedTests,
      certifications: certificates,
    });
  };

  // Render steps
  if (currentStep === "select-skills") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-4 transition-transform active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{businessName}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Step 1 of 3: Select your skills and get certified
            </p>
          </div>

          {/* Content */}
          <SkillsSelection onSkillsSelected={handleSkillsSelected} selectedSkills={selectedSkills} />
        </div>
      </div>
    );
  }

  if (currentStep === "take-tests") {
    const currentSkill = selectedSkills[currentTestIndex];
    const currentTestData = skillTests[currentSkill];

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header with Progress */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Skill Verification Tests</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Step {currentTestIndex + 1} of {selectedSkills.length}: <span className="text-orange-600 font-bold">{currentSkill.charAt(0).toUpperCase() + currentSkill.slice(1)}</span>
            </p>

            {/* Progress Bar */}
            <div className="mt-4 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-orange-500 transition-all duration-700 ease-out-expo"
                style={{
                  width: `${((currentTestIndex + 1) / selectedSkills.length) * 100}%`,
                }}
              />
            </div>

            {/* Test Progress Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedSkills.map((skill, idx) => {
                const prog = testProgress[idx];
                return (
                  <button
                    key={skill}
                    onClick={() => prog?.completed && setCurrentTestIndex(idx)}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 ${
                      idx === currentTestIndex
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                        : prog?.completed
                        ? prog.passed
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : "bg-white border-2 border-gray-100 text-gray-400"
                    } ${prog?.completed && idx !== currentTestIndex ? "cursor-pointer hover:bg-gray-50 hover:text-gray-900" : ""}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {skill.substring(0, 3).toUpperCase()}
                      {prog?.completed && (
                        <span className="text-[10px]">{prog.passed ? "✓" : "✗"}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Component */}
          {currentTestData ? (
            <TestQuestionnaire
              test={currentTestData}
              onComplete={handleTestComplete}
              businessId={businessId}
            />
          ) : (
            <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-8 text-center animate-pulse">
              <p className="text-yellow-900 font-black uppercase tracking-widest text-sm">Deployment Check: Test data offline for {currentSkill}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === "complete") {
    const passedTests = completedTests.filter((t) => t.passed);
    const totalScore = completedTests.length > 0
      ? Math.round(
          completedTests.reduce((sum, t) => sum + (t.percentageScore || 0), 0) /
            completedTests.length
        )
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Success Card */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Assessment Vault Locked</h1>
            <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto">
              Verification cycle finished. You&apos;ve completed {completedTests.length} digital skill checkmarks.
            </p>
          </div>

          {/* Results Summary */}
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {completedTests.map((attempt) => (
              <div
                key={attempt.attemptId}
                className={`rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                  attempt.passed ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                      {attempt.skillId}
                    </h3>
                    <p className={`text-xs font-black mt-1 uppercase tracking-widest ${
                      attempt.passed ? "text-green-700" : "text-red-700"
                    }`}>
                      {attempt.passed ? "✓ Certified" : "✗ Review Required"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-orange-600">
                      {Math.round(attempt.percentageScore || 0)}%
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Proficiency</p>
                  </div>
                </div>
                {attempt.certificateId && (
                  <div className="mt-6 p-4 bg-white/50 rounded-xl border border-green-200/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Vault Key (Digital ID)</p>
                    <p className="text-xs font-mono text-green-700 font-bold break-all">
                      {attempt.certificateId}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Stats */}
          <div className="rounded-3xl border-2 border-orange-200 bg-orange-50/50 p-8 mb-10 shadow-orange-100/50">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-black text-orange-600 leading-none">{passedTests.length}/{completedTests.length}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Pass Rate</p>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-orange-600 leading-none">{totalScore}%</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Avg Badge</p>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-green-600 leading-none">{passedTests.length}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Digital Certs</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleContinueToRegistration}
              disabled={loading}
              className="px-8 py-3 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Continue to Business Registration"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
