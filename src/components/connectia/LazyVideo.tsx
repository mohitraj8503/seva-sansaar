import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export const LazyVideo = ({ src, poster }: { src: string, poster?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-auto rounded-lg overflow-hidden bg-black/20 min-h-[200px]">
      {isInView ? (
        <video src={src} poster={poster} controls className="w-full h-auto rounded-lg max-h-[400px]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-white/20" size={32} />
        </div>
      )}
    </div>
  );
};
