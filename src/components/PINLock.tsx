"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, AlertCircle, Fingerprint } from 'lucide-react';
import { chatLock } from '@/lib/chatLock';
import { biometric } from '@/lib/biometric';

interface PINLockProps {
  onUnlock: () => void;
  userId: string;
}

export const PINLock: React.FC<PINLockProps> = ({ onUnlock, userId }) => {
  const [pin, setPin] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [attempts, setAttempts] = useState(5);
  const [canBiometric, setCanBiometric] = useState(false);

  useEffect(() => {
    const checkLockout = () => {
      const time = chatLock.getLockoutTimeRemaining(userId);
      setLockoutTime(time);
      setAttempts(chatLock.getAttemptsRemaining(userId));
    };
    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    
    // Check for biometric availability
    const checkBiometric = async () => {
      const supported = await biometric.isSupported();
      const enrolled = biometric.isEnrolled(userId);
      setCanBiometric(supported && enrolled);
      
      // Auto-trigger biometric on load if available
      if (supported && enrolled) {
        setTimeout(tryBiometric, 500);
      }
    };
    checkBiometric();

    return () => clearInterval(timer);
  }, [userId]);

  const handleNumber = async (n: string) => {
    if (lockoutTime > 0 || pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) {
      const result = await chatLock.verifyAndUnlock(userId, next);
      if (result === 'success') {
        setIsSuccess(true);
        setTimeout(onUnlock, 800);
      } else if (result === 'wrong') {
        setIsWrong(true);
        setPin("");
        setAttempts(chatLock.getAttemptsRemaining(userId));
        setTimeout(() => setIsWrong(false), 500);
      } else {
        setLockoutTime(chatLock.getLockoutTimeRemaining(userId));
      }
    }
  };

  const tryBiometric = async () => {
    const success = await biometric.authenticate(userId);
    if (success) {
      setIsSuccess(true);
      setTimeout(onUnlock, 500);
    }
  };

  const handleBackspace = () => setPin(p => p.slice(0, -1));

  const formatLockout = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: '100%' }} 
      animate={{ y: 0 }} 
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-black"
      style={{
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)'
      }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
          <Lock size={28} className="text-white/60" />
        </div>
        <h1 className="text-[32px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>SevaSansaar</h1>
        <p className="text-white/40 text-sm">{lockoutTime > 0 ? "Too many attempts" : "Enter your PIN to continue"}</p>
      </div>

      <motion.div 
        animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-12"
      >
        {[1,2,3,4].map(i => (
          <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500/20 relative overflow-hidden flex items-center justify-center">
            <AnimatePresence>
              {pin.length >= i && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0 }} 
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={clsx("w-full h-full rounded-full", isSuccess ? "bg-green-500" : isWrong ? "bg-rose-500" : "bg-indigo-500")}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {lockoutTime > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <span className="text-white font-bold text-4xl">{formatLockout(lockoutTime)}</span>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Try again in</p>
        </div>
      ) : (
        <>
          {attempts < 5 && <p className="text-rose-500 text-xs font-bold mb-8 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14} /> Incorrect PIN. {attempts} attempts remaining</p>}
          <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <motion.button 
                key={n} 
                whileTap={{ scale: 0.92 }}
                onClick={() => handleNumber(n.toString())}
                className="w-[72px] h-[72px] rounded-2xl bg-white/5 text-white font-bold text-2xl flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all"
              >
                {n}
              </motion.button>
            ))}
            <div className="flex items-center justify-center">
              {canBiometric && (
                <button onClick={tryBiometric} className="text-white/20 hover:text-white transition-colors">
                  <Fingerprint size={32} />
                </button>
              )}
            </div>
            <motion.button 
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNumber("0")}
              className="w-[72px] h-[72px] rounded-2xl bg-white/5 text-white font-bold text-2xl flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all"
            >
              0
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.92 }}
              onClick={handleBackspace}
              className="w-[72px] h-[72px] rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-all"
            >
              <Delete size={24} />
            </motion.button>
          </div>
        </>
      )}

      <button 
        onClick={() => { if(confirm("This will delete your PIN. You will need to set it up again.")) { chatLock.disable(userId); window.location.reload(); } }}
        className="mt-16 text-rose-500/40 hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        Forgot PIN? Reset App Data
      </button>
    </motion.div>
  );
};

const clsx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');
