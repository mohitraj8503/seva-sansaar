// Skills and Certification Types

export type SkillCategory = 
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "painting"
  | "ac-repair"
  | "appliance-repair"
  | "cleaning"
  | "welding"
  | "masonry"
  | "gardening";

export interface Skill {
  id: SkillCategory;
  name: string;
  description: string;
  icon: string;
  category: string;
  testId: string;
}

export interface PracticalQuestion {
  id: string;
  question: string;
  scenario: string; // Problem statement
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: "a" | "b" | "c" | "d";
  explanation: string;
  skillRequired: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface SkillTest {
  testId: string;
  skillId: SkillCategory;
  skillName: string;
  totalQuestions: number;
  passingScore: number; // typically 70%
  timeLimit: number; // in minutes
  questions: PracticalQuestion[];
}

export interface TestAttempt {
  attemptId: string;
  businessId: string;
  skillId: SkillCategory;
  testId: string;
  startedAt: number;
  completedAt?: number;
  answers: Record<string, "a" | "b" | "c" | "d">; // questionId -> answer
  score?: number;
  percentageScore?: number;
  passed?: boolean;
  certificateId?: string;
}

export interface SkillCertificate {
  certificateId: string;
  businessId: string;
  skillId: SkillCategory;
  skillName: string;
  issuedAt: number;
  expiresAt: number; // 2 years from issue
  score: number;
  verificationCode: string; // For sharing/verification
}

export interface ProfileSkill {
  skillId: SkillCategory;
  skillName: string;
  certified: boolean;
  certificateId?: string;
  score?: number;
  completedAt?: number;
  attempts: number;
}

export interface BusinessProfile extends Record<string, unknown> {
  businessId: string;
  ownerEmail: string;
  businessName: string;
  category: string;
  phone: string;
  address: string;
  skills: ProfileSkill[];
  certifications: SkillCertificate[];
  registrationStatus: "pending-skills" | "pending-tests" | "certified" | "active";
}
