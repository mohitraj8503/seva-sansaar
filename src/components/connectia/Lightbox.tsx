import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Message } from '@/types';

interface LightboxProps {
  current: { url: string; messageId: string } | null;
  allMessages: Message[];
  onClose: () => void;
}

export const Lightbox = ({ current, allMessages, onClose }: LightboxProps) => {
  const images = allMessages.filter(m => m.type === 'image' && m.file_url);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (current) {
      let idx = images.findIndex(img => img.id === current.messageId);
      if (idx === -1) {
        idx = images.findIndex(img => img.file_url === current.url);
      }
      setCurrentIndex(idx);
    }
  }, [current, images]);

  if (!current || currentIndex === -1) return null;

  const nextImage = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevImage = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const currentImg = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center pt-safe pb-safe"
    >
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-[1001]">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-white text-sm font-black tracking-tight">Gallery</span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{currentIndex + 1} / {images.length}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <a 
            href={currentImg.file_url!} 
            download 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Download size={20} />
          </a>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* IMAGE VIEWER */}
      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit={true}
          doubleClick={{ mode: "reset" }}
        >
          {({ resetTransform }) => (
            <>
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <motion.img 
                  key={currentImg.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  src={currentImg.file_url!} 
                  alt="" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" 
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.y) > 150) onClose();
                  }}
                />
              </TransformComponent>

              {/* NAVIGATION CONTROLS */}
              {currentIndex > 0 && (
                <button 
                  onClick={() => { prevImage(); resetTransform(); }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white z-[1002] hover:bg-black/40 transition-colors"
                >
                  <ChevronLeft size={28} />
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button 
                  onClick={() => { nextImage(); resetTransform(); }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center text-white z-[1002] hover:bg-black/40 transition-colors"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </>
          )}
        </TransformWrapper>
      </div>

      {/* CAPTION AREA */}
      {currentImg.text && currentImg.text !== '[Encrypted Message]' && (
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm leading-relaxed max-w-2xl mx-auto text-center font-medium">
            {currentImg.text}
          </p>
        </div>
      )}
      
      <p className="absolute bottom-6 text-white/20 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
        Pinch to zoom • Swipe up/down to close
      </p>
    </motion.div>
  );
};
