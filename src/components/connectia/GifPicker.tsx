import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [gifs, setGifs] = useState<{ id: string, images: { fixed_height: { url: string } } }[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const fetchGifs = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q 
        ? `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${q}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifs("");
  }, [fetchGifs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-20 left-0 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-50 flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5">
          <Search size={14} className="text-gray-400" />
          <input 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchGifs(e.target.value);
            }}
            placeholder="Search GIFs..." 
            className="bg-transparent border-none outline-none text-xs flex-1 ml-2 text-black"
          />
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <X size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 scrollbar-hide">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-indigo-500" />
          </div>
        ) : gifs.map((gif) => (
          <button 
            key={gif.id}
            onClick={() => onSelect(gif.images.fixed_height.url)}
            className="rounded-xl overflow-hidden hover:scale-[1.02] transition-transform active:scale-95"
          >
            <Image 
              src={gif.images.fixed_height.url} 
              alt="GIF" 
              width={200} 
              height={128} 
              className="w-full h-32 object-cover" 
              unoptimized 
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
};
