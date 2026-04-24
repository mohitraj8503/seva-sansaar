"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';
import { chatLock } from '@/lib/chatLock';
import { biometric } from '@/lib/biometric';

interface PINSetupProps {
  onComplete: () => void;
  userId: string;
}

export const PINSetup: React.FC<PINSetupProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  const handleVerify = useCallback(async (finalConfirm: string) => {
    if (pin === finalConfirm) {
      setIsSuccess(true);
      await chatLock.setupPIN(userId, pin);
      
      const supported = await biometric.isSupported();
      if (supported) {
        setStep(3); // Show biometric prompt
      } else {
        setTimeout(onComplete, 1000);
      }
    } else {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setStep(1);
        setPin("");
        setConfirmPin("");
      }, 500);
    }
  }, [onComplete, pin, userId]);

  const handleNumber = useCallback((n: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        const next = pin + n;
        setPin(next);
        if (next.length === 4) setTimeout(() => setStep(2), 300);
      }
    } else if (step === 2) {
      if (confirmPin.length < 4) {
        const next = confirmPin + n;
        setConfirmPin(next);
        if (next.length === 4) handleVerify(next);
      }
    }
  }, [confirmPin, handleVerify, pin, step]);

  const handleBackspace = useCallback(() => {
    if (step === 1) setPin(p => p.slice(0, -1));
    else if (step === 2) setConfirmPin(p => p.slice(0, -1));
  }, [step]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 3) return;
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, pin, confirmPin, handleNumber, handleBackspace]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        className="w-full max-w-[360px] flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
          <Lock size={32} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {isSuccess && step !== 3 ? "Success!" : step === 3 ? "Enable Fingerprint?" : step === 1 ? "Create PIN" : "Confirm PIN"}
        </h2>
        <p className="text-white/40 text-sm mb-12">
          {step === 3 ? "Use your phone's biometric to unlock faster" : "Set a 4-digit PIN to protect your chats"}
        </p>

        {step === 3 ? (
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={async () => {
                await biometric.register(userId, "User");
                onComplete();
              }}
              className="w-full h-14 bg-indigo-600 rounded-2xl text-white font-bold tap-scale transition-all"
            >
              Enable Biometric
            </button>
            <button 
              onClick={onComplete}
              className="w-full h-14 bg-white/5 rounded-2xl text-white/40 font-bold tap-scale transition-all"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-16">
              {[1,2,3,4].map(i => {
                const filled = (step === 1 ? pin.length >= i : confirmPin.length >= i);
                return (
                  <div key={i} className="w-4 h-4 rounded-full border-2 border-indigo-500/30 relative overflow-hidden">
                    <AnimatePresence>
                      {filled && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          exit={{ scale: 0 }} 
                          className={clsx("absolute inset-0 rounded-full", isSuccess ? "bg-green-500" : isWrong ? "bg-rose-500" : "bg-indigo-500")}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-8 w-full max-w-[280px]">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <motion.button 
                  key={n} 
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleNumber(n.toString())}
                  className="w-16 h-16 rounded-2xl bg-white/5 text-white font-bold text-xl flex items-center justify-center hover:bg-white/10"
                >
                  {n}
                </motion.button>
              ))}
              <div />
              <motion.button 
                whileTap={{ scale: 0.88 }}
                onClick={() => handleNumber("0")}
                className="w-16 h-16 rounded-2xl bg-white/5 text-white font-bold text-xl flex items-center justify-center hover:bg-white/10"
              >
                0
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.88 }}
                onClick={handleBackspace}
                className="w-16 h-16 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10"
              >
                <Delete size={20} />
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const clsx = (...args: (string | boolean | undefined | null)[]) => args.filter(Boolean).join(' ');
