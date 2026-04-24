import { useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Profile } from '@/types';

export const useChatSecurity = (currentUser: Profile | null, setToast: (m: string | null) => void) => {
  const { isUnlocked, setUnlocked, lockChat } = useChatStore();

  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optional: lock after delay
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  // Handle inactivity auto-lock
  useEffect(() => {
    if (!isUnlocked) return;
    
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lockChat();
        setToast("Session locked due to inactivity");
      }, 10 * 60 * 1000); // 10 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [isUnlocked, lockChat, setToast]);

  return {
    isUnlocked,
    setIsUnlocked: setUnlocked
  };
};
