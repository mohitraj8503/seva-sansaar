import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export const TypingIndicator = ({ state }: { state: 'typing' | 'recording' }) => (
  <div className="flex items-center gap-4 px-6 md:px-12 lg:px-24 mb-6">
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex gap-1">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
      </div>
      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
        {state === 'recording' && <Mic size={10} className="animate-pulse" />}
        {state === 'recording' ? 'Recording audio...' : 'Typing...'}
      </span>
    </div>
  </div>
);
