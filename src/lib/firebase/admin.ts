/**
 * Firebase Admin SDK – server-side only (A3).
 * Lazy: no initialization until first use, so `next build` works without env vars.
 */
import * as admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";

function getServiceAccountConfig(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  const cfg = getServiceAccountConfig();
  if (!cfg) return null;
  return admin.initializeApp({
    credential: admin.credential.cert(cfg),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.firestore(app);
}

function getAuth(): admin.auth.Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.auth(app);
}

function getStorage(): admin.storage.Storage | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.storage(app);
}

function proxyFirestore(): Firestore {
  return new Proxy({} as Firestore, {
    get(_target, prop, receiver) {
      const db = getAdminDb();
      if (!db) {
        throw new Error(
          "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
        );
      }
      return Reflect.get(db as object, prop, receiver);
    },
  });
}

function proxyAuth(): admin.auth.Auth {
  return new Proxy({} as admin.auth.Auth, {
    get(_target, prop, receiver) {
      const a = getAuth();
      if (!a) {
        throw new Error(
          "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
        );
      }
      return Reflect.get(a as object, prop, receiver);
    },
  });
}

function proxyStorage(): admin.storage.Storage {
  return new Proxy({} as admin.storage.Storage, {
    get(_target, prop, receiver) {
      const s = getStorage();
      if (!s) {
        throw new Error(
          "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
        );
      }
      return Reflect.get(s as object, prop, receiver);
    },
  });
}

export const adminDb = proxyFirestore();
export const adminAuth = proxyAuth();
export const adminStorage = proxyStorage();

export default getAdminApp;
