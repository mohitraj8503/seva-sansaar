const SESSION_KEY = 'connectia_session_token';
const SESSION_EXPIRY_KEY = 'connectia_session_expiry';
const SESSION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export const sessionManager = {
  // Call this after successful Supabase login
  createSession: (userId: string) => {
    if (typeof window === 'undefined') return;
    const expiry = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
  },

  // Returns true if session is still valid (within 3 hour window)
  isSessionValid: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = sessionStorage.getItem(SESSION_KEY);
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
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  },

  // Get stored userId from session
  getUserId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_KEY);
  }
};
