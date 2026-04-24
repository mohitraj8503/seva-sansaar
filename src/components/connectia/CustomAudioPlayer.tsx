import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { clsx } from 'clsx';

export const CustomAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  return (
    <div className="flex flex-col gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-[2rem] min-w-[280px] border border-white/10 shadow-xl">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
        onEnded={() => setIsPlaying(false)} 
      />
      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-90 transition-all shrink-0"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-3">
          {/* WAVEFORM VISUALIZER (FAKE BUT PREMIUM) */}
          <div className="h-8 flex items-center gap-[2px] px-1 overflow-hidden">
             {Array.from({ length: 30 }).map((_, i) => (
               <div 
                 key={i}
                 className={clsx(
                   "w-1 rounded-full transition-all duration-300",
                   progress > (i / 30) * 100 ? "bg-indigo-500" : "bg-white/20"
                 )}
                 style={{ 
                   height: `${Math.max(20, Math.sin(i * 0.5) * 60 + 40)}%`,
                   opacity: isPlaying ? 1 : 0.6
                 }}
               />
             ))}
          </div>

          <div className="relative flex flex-col gap-1">
            <input 
              type="range" 
              value={progress} 
              onChange={onSeek} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
              <span>{Math.floor((audioRef.current?.currentTime || 0) / 60)}:{(Math.floor(audioRef.current?.currentTime || 0) % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={cycleSpeed} 
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-white/20 transition-all shrink-0 border border-white/5"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
