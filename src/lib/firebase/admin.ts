import "server-only";

import * as admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getServiceAccountConfig(): ServiceAccountConfig | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.apps[0] ?? null;
  }

  const config = getServiceAccountConfig();

  if (!config) {
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();

  return app ? admin.firestore(app) : null;
}

function getAdminAuth(): admin.auth.Auth | null {
  const app = getAdminApp();

  return app ? admin.auth(app) : null;
}

function getAdminStorage(): admin.storage.Storage | null {
  const app = getAdminApp();

  return app ? admin.storage(app) : null;
}

function firebaseConfigError(): Error {
  return new Error(
    "Firebase Admin is not configured. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY."
  );
}

function createFirestoreProxy(): Firestore {
  return new Proxy({} as Firestore, {
    get(_target, property, receiver) {
      const db = getAdminDb();

      if (!db) {
        throw firebaseConfigError();
      }

      return Reflect.get(db as object, property, receiver);
    },
  });
}

function createAuthProxy(): admin.auth.Auth {
  return new Proxy({} as admin.auth.Auth, {
    get(_target, property, receiver) {
      const auth = getAdminAuth();

      if (!auth) {
        throw firebaseConfigError();
      }

      return Reflect.get(auth as object, property, receiver);
    },
  });
}

function createStorageProxy(): admin.storage.Storage {
  return new Proxy({} as admin.storage.Storage, {
    get(_target, property, receiver) {
      const storage = getAdminStorage();

      if (!storage) {
        throw firebaseConfigError();
      }

      return Reflect.get(storage as object, property, receiver);
    },
  });
}

export const adminDb = createFirestoreProxy();
export const adminAuth = createAuthProxy();
export const adminStorage = createStorageProxy();

export default getAdminApp;