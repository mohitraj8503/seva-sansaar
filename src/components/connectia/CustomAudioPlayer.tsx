import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

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
    <div className="flex flex-col gap-2 bg-black/10 p-4 rounded-2xl min-w-[240px]">
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
          className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <input 
            type="range" 
            value={progress} 
            onChange={onSeek} 
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
          />
          <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest">
            <span>{Math.floor((audioRef.current?.currentTime || 0) / 60)}:{(Math.floor(audioRef.current?.currentTime || 0) % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        <button 
          onClick={cycleSpeed} 
          className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white hover:bg-white/20 transition-all min-w-[35px]"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
