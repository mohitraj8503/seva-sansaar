import { useState, useEffect } from 'react';

export const useChatSettings = (activePartnerId?: string) => {
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isMuted, setIsMuted] = useState(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  useEffect(() => {
    if (activePartnerId) {
      const savedG = localStorage.getItem(`wallpaper_${activePartnerId}`);
      const savedU = localStorage.getItem(`wallpaper_url_${activePartnerId}`);
      if (savedG) setWallpaper(savedG);
      else if (savedU) setWallpaperUrl(savedU);
      else { setWallpaper(null); setWallpaperUrl(null); }
    }
    const muted = localStorage.getItem('sevasansaar_muted');
    setIsMuted(!!muted);
  }, [activePartnerId]);

  return {
    sidebarWidth, setSidebarWidth,
    isMuted, setIsMuted,
    wallpaper, setWallpaper,
    wallpaperUrl, setWallpaperUrl,
    expiryTime, setExpiryTime
  };
};
