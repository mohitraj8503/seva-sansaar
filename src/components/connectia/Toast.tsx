import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const Toast = ({ message, onClear }: { message: string, onClear: () => void }) => {
  useEffect(() => { 
    const timer = setTimeout(onClear, 2000); 
    return () => clearTimeout(timer); 
  }, [onClear]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      exit={{ y: 20, opacity: 0 }} 
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-[500] flex items-center gap-2 border border-white/10"
    >
      <Check size={14} className="text-green-500" /> {message}
    </motion.div>
  );
};
