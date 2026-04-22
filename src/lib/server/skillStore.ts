import { getAdminDb } from "@/lib/firebase/admin";
import { localDb } from "@/lib/server/localDb";
import type { TestAttempt, SkillCertificate } from "@/lib/types/skills";

const COL_ATTEMPTS = "skillTestAttempts";
const COL_CERTIFICATES = "skillCertificates";

function getFirestore() {
  return getAdminDb();
}

export async function saveTestAttempt(attempt: TestAttempt): Promise<void> {
  const db = getFirestore();
  if (db) {
    await db.collection(COL_ATTEMPTS).doc(attempt.attemptId).set(attempt);
    return;
  }
  const data = localDb.read();
  data.skillTestAttempts = data.skillTestAttempts || {};
  data.skillTestAttempts[attempt.attemptId] = attempt;
  localDb.write(data);
}

export async function saveCertificate(cert: SkillCertificate): Promise<void> {
  const db = getFirestore();
  if (db) {
    await db.collection(COL_CERTIFICATES).doc(cert.certificateId).set(cert);
    return;
  }
  const data = localDb.read();
  data.skillCertificates = data.skillCertificates || {};
  data.skillCertificates[cert.certificateId] = cert;
  localDb.write(data);
}

export async function getAttemptsByBusiness(businessId: string): Promise<TestAttempt[]> {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_ATTEMPTS).where("businessId", "==", businessId).get();
    return snap.docs.map(d => d.data() as TestAttempt);
  }
  const data = localDb.read();
  return Object.values(data.skillTestAttempts || {}).filter(a => a.businessId === businessId);
}

export async function getCertificatesByBusiness(businessId: string): Promise<SkillCertificate[]> {
  const db = getFirestore();
  if (db) {
    const snap = await db.collection(COL_CERTIFICATES).where("businessId", "==", businessId).get();
    return snap.docs.map(d => d.data() as SkillCertificate);
  }
  const data = localDb.read();
  return Object.values(data.skillCertificates || {}).filter(c => c.businessId === businessId);
}
