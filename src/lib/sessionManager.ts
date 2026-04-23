const SESSION_KEY = 'sevasansaar_session_token';
const SESSION_EXPIRY_KEY = 'sevasansaar_session_expiry';
const SESSION_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour

export const sessionManager = {
  // Call this after successful Supabase login
  createSession: (userId: string) => {
    if (typeof window === 'undefined') return;
    const expiry = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
  },

  // Returns true if session is still valid (within 1 hour window)
  isSessionValid: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(SESSION_KEY);
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  },

  // Returns remaining session time in minutes
  getTimeRemaining: (): number => {
    if (typeof window === 'undefined') return 0;
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiry) return 0;
    return Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 60000));
  },

  // Call on logout or session clear
  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  },

  // Get stored userId from session
  getUserId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_KEY);
  }
};
