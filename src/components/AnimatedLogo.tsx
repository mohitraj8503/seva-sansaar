"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { clsx } from "clsx";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

export const AnimatedLogo = ({ className, size = "md", priority = false }: AnimatedLogoProps) => {
  const dimensions = {
    sm: { width: 140, height: 40 },
    md: { width: 240, height: 80 },
    lg: { width: 320, height: 100 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className={clsx("relative flex flex-col items-center", className)}>
      {/* Tricolor Sweep Reveal Effect */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-1 left-0 right-0 h-[2px] z-10 origin-left"
        style={{
          background: "linear-gradient(to right, #FF9933, #FFFFFF, #138808)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: [1, 1.015, 1]
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.3 },
          y: { duration: 0.6, delay: 0.3 },
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileTap={{ scale: 0.96 }}
        className="relative"
        style={{ width, height }}
      >
        <Image
          src="/app-logo.png"
          alt="Seva Sansaar"
          fill
          className="object-contain"
          priority={priority}
        />
      </motion.div>
    </div>
  );
};
