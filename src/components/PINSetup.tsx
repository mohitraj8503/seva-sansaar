"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';
import { chatLock } from '@/lib/chatLock';

interface PINSetupProps {
  onComplete: () => void;
  userId: string;
}

export const PINSetup: React.FC<PINSetupProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNumber = (n: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        const next = pin + n;
        setPin(next);
        if (next.length === 4) setTimeout(() => setStep(2), 300);
      }
    } else {
      if (confirmPin.length < 4) {
        const next = confirmPin + n;
        setConfirmPin(next);
        if (next.length === 4) handleVerify(next);
      }
    }
  };

  const handleVerify = async (finalConfirm: string) => {
    if (pin === finalConfirm) {
      setIsSuccess(true);
      await chatLock.setupPIN(userId, pin);
      setTimeout(onComplete, 1000);
    } else {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setStep(1);
        setPin("");
        setConfirmPin("");
      }, 500);
    }
  };

  const handleBackspace = () => {
    if (step === 1) setPin(p => p.slice(0, -1));
    else setConfirmPin(p => p.slice(0, -1));
  };

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
        
        <h2 className="text-2xl font-bold text-white mb-2">{isSuccess ? "Success!" : step === 1 ? "Create PIN" : "Confirm PIN"}</h2>
        <p className="text-white/40 text-sm mb-12">Set a 4-digit PIN to protect your chats</p>

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
      </motion.div>
    </motion.div>
  );
};

const clsx = (...args: (string | boolean | undefined | null)[]) => args.filter(Boolean).join(' ');
