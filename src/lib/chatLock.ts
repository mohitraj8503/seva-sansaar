import { hashPIN, verifyPIN } from './pinHash';

const getKeys = (userId: string) => ({
  LOCK_KEY: `connectia_pin_hash_${userId}`,
  ATTEMPTS_KEY: `connectia_pin_attempts_${userId}`,
  LOCKOUT_KEY: `connectia_lockout_until_${userId}`
});

export const chatLock = {
  isLocked: (userId: string): boolean => {
    if (typeof window === 'undefined' || !userId) return false;
    const keys = getKeys(userId);
    return !!localStorage.getItem(keys.LOCK_KEY);
  },

  async setupPIN(userId: string, pin: string): Promise<void> {
    if (!userId) return;
    const keys = getKeys(userId);
    const hash = await hashPIN(pin);
    localStorage.setItem(keys.LOCK_KEY, hash);
    localStorage.removeItem(keys.ATTEMPTS_KEY);
    localStorage.removeItem(keys.LOCKOUT_KEY);
  },

  async verifyAndUnlock(userId: string, pin: string): Promise<'success' | 'wrong' | 'locked'> {
    if (!userId) return 'wrong';
    const keys = getKeys(userId);
    
    const lockoutUntil = localStorage.getItem(keys.LOCKOUT_KEY);
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      return 'locked';
    }

    const storedHash = localStorage.getItem(keys.LOCK_KEY);
    if (!storedHash) return 'success';

    const isCorrect = await verifyPIN(pin, storedHash);

    if (isCorrect) {
      localStorage.removeItem(keys.ATTEMPTS_KEY);
      localStorage.removeItem(keys.LOCKOUT_KEY);
      return 'success';
    } else {
      const attempts = parseInt(localStorage.getItem(keys.ATTEMPTS_KEY) || '0') + 1;
      localStorage.setItem(keys.ATTEMPTS_KEY, attempts.toString());

      if (attempts >= 5) {
        const lockDuration = attempts >= 15 ? 10 * 60 * 1000 : 30 * 1000;
        localStorage.setItem(keys.LOCKOUT_KEY, (Date.now() + lockDuration).toString());
        localStorage.removeItem(keys.ATTEMPTS_KEY);
      }
      return 'wrong';
    }
  },

  disable(userId: string): void {
    if (!userId) return;
    const keys = getKeys(userId);
    localStorage.removeItem(keys.LOCK_KEY);
    localStorage.removeItem(keys.ATTEMPTS_KEY);
    localStorage.removeItem(keys.LOCKOUT_KEY);
  },

  getLockoutTimeRemaining(userId: string): number {
    if (!userId) return 0;
    const keys = getKeys(userId);
    const lockoutUntil = localStorage.getItem(keys.LOCKOUT_KEY);
    if (!lockoutUntil) return 0;
    return Math.max(0, parseInt(lockoutUntil) - Date.now());
  },

  getAttemptsRemaining(userId: string): number {
    if (!userId) return 0;
    const keys = getKeys(userId);
    const attempts = parseInt(localStorage.getItem(keys.ATTEMPTS_KEY) || '0');
    return Math.max(0, 5 - attempts);
  }
};
