import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Blurhash } from 'react-blurhash';
import { clsx } from 'clsx';
import { Message } from '@/types';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface ImageBubbleProps {
  message: Message;
  onLightbox: (url: string) => void;
}

export const ImageBubble = ({ message, onLightbox }: ImageBubbleProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const aspectRatio = message.width && message.height ? message.width / message.height : 1;
  
  // Calculate display dimensions based on WhatsApp-style rules
  const maxWidth = 260;
  const maxHeight = 320;
  
  let displayWidth = maxWidth;
  let displayHeight = displayWidth / aspectRatio;
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = displayHeight * aspectRatio;
  }

  return (
    <div className="flex flex-col gap-1">
      <motion.div
        className={clsx(
          "relative rounded-2xl overflow-hidden cursor-pointer shadow-sm group",
          message.status === 'sending' && "animate-pulse"
        )}
        style={{ 
          width: displayWidth, 
          height: displayHeight,
          backgroundColor: '#f3f4f6' 
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onLightbox(message.file_url!)}
      >
        {/* BLUR PLACEHOLDER (BLURHASH OR THUMBNAIL) */}
        {!isLoaded && (
          <div className="absolute inset-0 z-10">
            {message.blur_hash ? (
              <Blurhash
                hash={message.blur_hash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
            ) : message.thumbnail_url ? (
              <img 
                src={message.thumbnail_url} 
                alt="" 
                className="w-full h-full object-cover blur-xl scale-110"
              />
            ) : null}
          </div>
        )}

        {/* MAIN IMAGE */}
        <Image
          src={message.file_url!}
          alt=""
          width={displayWidth}
          height={displayHeight}
          loading="lazy"
          className={clsx(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoadingComplete={() => setIsLoaded(true)}
          unoptimized={message.file_url!.startsWith('data:')}
        />

        {/* LOADING SHIMMER IF NO THUMBNAIL */}
        {!message.thumbnail_url && !isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
        )}
      </motion.div>

      {/* VOICE ATTACHMENT (IMAGE + VOICE COMBO) */}
      {message.voice_url && (
        <div className="mt-2 bg-black/5 rounded-2xl p-2">
          <CustomAudioPlayer src={message.voice_url} />
        </div>
      )}

      {/* CAPTION (IF ANY) */}
      {message.text && message.text !== '[Encrypted Message]' && (
        <p className="px-1 mt-1 text-[14px] leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
      )}
    </div>
  );
};
