import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, FileText, Maximize2 } from 'lucide-react';
import Image from "next/image";
import { clsx } from 'clsx';
import { Message } from '@/types';

interface MediaGalleryProps {
  messages: Message[];
  activeMediaTab: 'Images' | 'Videos' | 'Docs';
  setActiveMediaTab: (t: 'Images' | 'Videos' | 'Docs') => void;
  setShowMediaGallery: (s: boolean) => void;
  setLightboxImage: (i: string | null) => void;
}

export const MediaGallery = ({ 
  messages, activeMediaTab, setActiveMediaTab, setShowMediaGallery, setLightboxImage 
}: MediaGalleryProps) => {
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMediaGallery(false);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [setShowMediaGallery]);

  return (
    <motion.div 
      initial={{ y: '100%' }} 
      animate={{ y: 0 }} 
      exit={{ y: '100%' }} 
      className="absolute inset-0 bg-black z-[100] flex flex-col"
    >
      <header className="p-6 safe-top flex items-center justify-between bg-black/80 border-b border-white/5">
        <div 
          onClick={() => setShowMediaGallery(false)} 
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-all"
        >
          <X size={24} />
        </div>
        <h2 className="text-white font-black uppercase tracking-widest text-sm">Media & Docs</h2>
        <div className="w-10" />
      </header>
      
      <div className="flex bg-black border-b border-white/5">
        {(['Images', 'Videos', 'Docs'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveMediaTab(tab)}
            className={clsx(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative group",
              activeMediaTab === tab ? "text-indigo-500" : "text-white/40 hover:text-white"
            )}
          >
            {tab}
            <div className={clsx(
              "absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 transition-transform", 
              activeMediaTab === tab ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )} />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
        {messages.filter(m => {
          if (activeMediaTab === 'Images') return m.type === 'image';
          if (activeMediaTab === 'Videos') return m.type === 'video';
          if (activeMediaTab === 'Docs') return m.type === 'file';
          return false;
        }).filter(m => m.file_url).map(m => (
          <div 
            key={m.id} 
            className="aspect-square bg-white/5 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all" 
            onClick={() => { if(m.type === 'image' && m.file_url) setLightboxImage(m.file_url); }}
          >
            {m.type === 'image' ? (
              <Image 
                src={m.file_url!} 
                alt="Media" 
                fill 
                className="object-cover transition-transform group-hover:scale-110" 
                loading="lazy" 
              />
            ) : m.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all">
                <Play size={24} className="text-white" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all">
                <FileText size={24} className="text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 size={20} className="text-white" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
