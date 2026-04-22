import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import type { TestAttempt, SkillCertificate, SkillCategory } from "@/lib/types/skills";
import {
  saveTestAttempt,
  saveCertificate,
  getAttemptsByBusiness,
  getCertificatesByBusiness
} from "@/lib/server/skillStore";
import { parseOwnerAuth } from "@/lib/server/ownerAuth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import { SKILLS_PASS_PERCENTAGE, SKILLS_MAX_ATTEMPTS_PER_MONTH } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req.headers as unknown as Headers);
    const limitResult = checkRateLimit(`skills-test:${ip}`, RATE_LIMITS.SKILLS_TEST.max, RATE_LIMITS.SKILLS_TEST.windowMs);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many test submissions. Please try again later." }, { status: 429 });
    }

    // Require owner authentication
    const auth = parseOwnerAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Owner credentials required." }, { status: 401 });
    }

    const body = (await req.json()) as Partial<TestAttempt> & { passed?: boolean };
    const { businessId, skillId, testId, attemptId, score } = body;

    if (!businessId || !skillId || !testId) {
      return NextResponse.json({ error: "Missing required fields: businessId, skillId, testId" }, { status: 400 });
    }

    // Verify the authenticated business matches the request
    if (auth.businessId !== businessId) {
      return NextResponse.json({ error: "Unauthorized. Business ID does not match credentials." }, { status: 403 });
    }

    // Validate score is a number between 0-100
    if (typeof score !== "number" || isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: "Score must be a number between 0 and 100." }, { status: 400 });
    }

    // Server-side: calculate passed based on score (don't trust client)
    const passed = score >= SKILLS_PASS_PERCENTAGE;

    // Check monthly attempt limit
    const allAttempts = await getAttemptsByBusiness(businessId);
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentAttempts = allAttempts.filter((a) => a.startedAt >= oneMonthAgo);
    if (recentAttempts.length >= SKILLS_MAX_ATTEMPTS_PER_MONTH) {
      return NextResponse.json(
        { error: `Maximum ${SKILLS_MAX_ATTEMPTS_PER_MONTH} attempts per month exceeded. Try again next month.` },
        { status: 429 }
      );
    }

    const attempt: TestAttempt = {
      ...body as TestAttempt,
      businessId,
      skillId: skillId as SkillCategory,
      testId,
      attemptId: attemptId || `${testId}-${Date.now()}`,
      score: Math.round(score),
      passed,
      percentageScore: score,
    };

    await saveTestAttempt(attempt);

    let certificate: SkillCertificate | undefined;
    if (passed) {
      // Use cryptographically secure random bytes for verification code
      const verificationCode = randomBytes(4).toString("hex").toUpperCase();

      certificate = {
        certificateId: `cert-${businessId}-${skillId}-${Date.now()}`,
        businessId,
        skillId: skillId as SkillCategory,
        skillName: skillId.charAt(0).toUpperCase() + (skillId as string).slice(1),
        issuedAt: Date.now(),
        expiresAt: Date.now() + 2 * 365 * 24 * 60 * 60 * 1000,
        score: Math.round(score),
        verificationCode,
      };
      await saveCertificate(certificate);
    }

    return NextResponse.json({ success: true, attempt, certificate }, { status: 201 });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const businessId = params.get("businessId");
    const skillId = params.get("skillId");

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const [attempts, certificates] = await Promise.all([
      getAttemptsByBusiness(businessId),
      getCertificatesByBusiness(businessId)
    ]);

    const filteredAttempts = skillId ? attempts.filter(a => a.skillId === skillId) : attempts;

    return NextResponse.json({
      attempts: filteredAttempts,
      certificates: certificates,
    });
  } catch (error) {
    console.error("Error fetching test data:", error);
    return NextResponse.json({ error: "Failed to fetch test data" }, { status: 500 });
  }
}
