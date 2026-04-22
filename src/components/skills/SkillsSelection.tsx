"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import type { SkillCategory } from "@/lib/types/skills";
import { skillsDatabase } from "@/lib/skillsTestData";

interface SkillsSelectionProps {
  onSkillsSelected: (skills: SkillCategory[]) => void;
  selectedSkills: SkillCategory[];
}

export function SkillsSelection({ onSkillsSelected, selectedSkills }: SkillsSelectionProps) {
  const [selected, setSelected] = useState<Set<SkillCategory>>(new Set(selectedSkills));

  const handleSkillToggle = (skillId: SkillCategory) => {
    const newSelected = new Set(selected);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelected(newSelected);
  };

  const handleContinue = () => {
    if (selected.size > 0) {
      onSkillsSelected(Array.from(selected));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div>
        <h2 className="text-3xl font-black text-navy tracking-tight">Select Your Skills</h2>
        <p className="mt-2 text-gray-500 font-medium leading-relaxed">
          Choose all categories where you possess technical proficiency. Each selection requires a mandatory practical assessment.
        </p>
      </div>

      {/* Alert Info */}
      <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-6 flex gap-4 shadow-sm">
        <div className="bg-white rounded-xl p-3 shadow-premium-sm h-fit">
          <AlertCircle className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-sm">
          <p className="font-black text-blue-900 uppercase tracking-widest text-xs mb-1">Practical Assessment Cycle</p>
          <p className="text-blue-800 font-medium leading-relaxed">Each segment contains 10 technical scenarios (12-15 mins). Minimum passing threshold: <span className="font-black text-navy">70% Quality Score</span>.</p>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillsDatabase.map((skill) => (
          <button
            key={skill.id}
            onClick={() => handleSkillToggle(skill.id as SkillCategory)}
            className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 active:scale-95 ${
              selected.has(skill.id as SkillCategory)
                ? "border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-100"
                : "border-gray-50 bg-white hover:border-gray-200"
            }`}
          >
            {/* Checkmark */}
            <div className={`absolute top-4 right-4 rounded-full p-1.5 transition-all duration-300 ${
              selected.has(skill.id as SkillCategory) ? "bg-orange-500 scale-100" : "bg-gray-100 scale-75 opacity-0 group-hover:opacity-100"
            }`}>
              <Check className={`h-4 w-4 text-white transition-opacity ${selected.has(skill.id as SkillCategory) ? "opacity-100" : "opacity-0"}`} />
            </div>

            {/* Content */}
            <div className={`text-4xl mb-4 transition-transform duration-300 ${selected.has(skill.id as SkillCategory) ? 'scale-110' : 'group-hover:scale-110'}`}>
              {skill.icon}
            </div>
            <h3 className="font-black text-navy uppercase tracking-tight">{skill.name}</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed line-clamp-2">{skill.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] text-gray-400 font-black uppercase tracking-widest border border-gray-100">
               10 SEGMENTS • {skill.testId ? "15 MINS" : "OFFLINE"}
            </div>
          </button>
        ))}
      </div>

      {/* Selection Summary */}
      {selected.size > 0 && (
        <div className="rounded-2xl bg-green-50 border-2 border-green-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in">
          <div>
            <p className="font-black text-green-900 uppercase tracking-widest text-xs mb-1">
              Assessment Load: {selected.size} Category{selected.size !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-green-800 font-medium">
              Estimated duration: <span className="font-black">{selected.size * 15} mins</span> total verification time.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-4">
        <button
          disabled={selected.size === 0}
          onClick={handleContinue}
          className={`px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl active:scale-95 ${
            selected.size === 0
              ? "bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-gray-50"
              : "bg-navy text-white shadow-navy/20 hover:-translate-y-1 hover:shadow-navy/40"
          }`}
        >
          Initialize Tests ({selected.size})
        </button>
      </div>
    </div>
  );
}
