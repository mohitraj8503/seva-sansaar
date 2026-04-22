/**
 * A1/A8 – Firebase Auth context + useAuth hook
 * Wraps Firebase onAuthStateChanged & exposes:
 *   user, loading, signIn, signInWithGoogle, signOut, getToken
 *
 * Gracefully handles missing Firebase config (e.g. no .env.local).
 */
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

/** Check if Firebase auth is actually configured (not an empty stub) */
const isAuthConfigured = Boolean(
  auth && typeof auth.onAuthStateChanged === 'function'
);

interface AuthContextValue {
  user:             User | null;
  loading:          boolean;
  signIn:           (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut:          () => Promise<void>;
  getToken:         () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(isAuthConfigured);

  useEffect(() => {
    if (!isAuthConfigured) return;

    const setSessionCookie = async (u: User | null) => {
      if (u) {
        const token = await u.getIdToken();
        // Keep cookie aligned with ID token refresh (onIdTokenChanged). Lax works for most scenarios.
        document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = '__session=; path=/; max-age=0';
      }
    };

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      await setSessionCookie(u);
    });

    const unsubToken = onIdTokenChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
    });

    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!isAuthConfigured) {
      console.warn('Firebase Auth is not configured. Cannot sign in.');
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    if (!isAuthConfigured) {
      console.warn('Firebase Auth is not configured. Cannot sign in with Google.');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOut() {
    if (!isAuthConfigured) return;
    await firebaseSignOut(auth);
  }

  async function getToken() {
    return user?.getIdToken() ?? null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
