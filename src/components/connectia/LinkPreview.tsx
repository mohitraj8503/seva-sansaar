import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

export const LinkPreview = ({ url }: { url: string }) => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!json.error) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [url]);

  if (loading) return (
    <div className="mt-2 p-3 bg-white/5 rounded-xl flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-2 bg-white/10 rounded w-full" />
      </div>
    </div>
  );
  
  if (!data) return null;

  return (
    <a 
      href={data.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="mt-2 block bg-white/10 rounded-xl overflow-hidden hover:bg-white/20 transition-colors group"
    >
      {data.image && (
        <div className="w-full h-32 relative">
          <Image src={data.image} alt="Preview" fill className="object-cover" />
        </div>
      )}
      <div className="p-3">
        <h4 className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
          {data.title}
        </h4>
        {data.description && (
          <p className="text-[9px] text-white/60 line-clamp-2 mt-1">{data.description}</p>
        )}
        <div className="flex items-center gap-1 mt-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
          <ExternalLink size={8} /> {new URL(data.url).hostname}
        </div>
      </div>
    </a>
  );
};
