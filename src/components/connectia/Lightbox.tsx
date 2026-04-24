import React from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

interface LightboxProps {
  src: string;
  onClose: () => void;
}

export const Lightbox = ({ src, onClose }: LightboxProps) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="fixed inset-0 z-[1000] bg-black/95 flex flex-col p-6 overflow-hidden"
  >
    <header className="flex justify-between items-center z-10">
       <button 
         onClick={onClose} 
         className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"
       >
         <X size={24} />
       </button>
       <button 
         className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"
       >
         <Download size={24} />
       </button>
    </header>
    <motion.div 
      initial={{ scale: 0.9 }} 
      animate={{ scale: 1 }} 
      className="flex-1 flex items-center justify-center"
    >
       <div className="relative w-full h-full">
         <Image src={src} alt="Lightbox" fill className="object-contain" />
       </div>
    </motion.div>
  </motion.div>
);
