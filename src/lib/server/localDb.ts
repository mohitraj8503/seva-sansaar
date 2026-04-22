import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { AnalyticsEvent, BookingRecord, BusinessRecord } from "@/lib/types/owner";
import type { TestAttempt, SkillCertificate } from "@/lib/types/skills";

type LocalShape = {
  businesses: Record<string, BusinessRecord>;
  bookings: Record<string, BookingRecord>;
  analytics: AnalyticsEvent[];
  skillTestAttempts: Record<string, TestAttempt>;
  skillCertificates: Record<string, SkillCertificate>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "seva-local-db.json");

function emptyDb(): LocalShape {
  return { 
    businesses: {}, 
    bookings: {}, 
    analytics: [], 
    skillTestAttempts: {}, 
    skillCertificates: {} 
  };
}

function readDb(): LocalShape {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw) as LocalShape;
  } catch {
    return emptyDb();
  }
}

function writeDb(data: LocalShape) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const localDb = {
  read: readDb,
  write: writeDb,
  genId() {
    return randomBytes(12).toString("hex");
  },
};
