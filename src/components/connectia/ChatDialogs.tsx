import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Camera } from 'lucide-react';
import { Profile, SpecialDate } from '@/types';
import dynamic from 'next/dynamic';

const PINSetup = dynamic(() => import('@/components/PINSetup').then(mod => mod.PINSetup), { ssr: false });

interface ChatDialogsProps {
  showSpecialDates: boolean;
  setShowSpecialDates: (s: boolean) => void;
  specialDates: SpecialDate[];
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (s: boolean) => void;
  handleLogout: () => void;
  showClearConfirm: boolean;
  setShowClearConfirm: (s: boolean) => void;
  handleClearChat: () => void;
  showWallpaperSheet: boolean;
  setShowWallpaperSheet: (s: boolean) => void;
  setPresetWallpaper: (g: string) => void;
  handleWallpaperUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeWallpaper: () => void;
  isOpeningSystemUI: React.MutableRefObject<boolean>;
  showSetup: boolean;
  setShowSetup: (s: boolean) => void;
  currentUser: Profile | null;
}

export const ChatDialogs = ({
  showSpecialDates, setShowSpecialDates, specialDates,
  showLogoutConfirm, setShowLogoutConfirm, handleLogout,
  showClearConfirm, setShowClearConfirm, handleClearChat,
  showWallpaperSheet, setShowWallpaperSheet, setPresetWallpaper, handleWallpaperUpload, removeWallpaper, isOpeningSystemUI,
  showSetup, setShowSetup, currentUser
}: ChatDialogsProps) => {
  return (
    <AnimatePresence>
      {showSpecialDates && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-8 bg-indigo-600 text-white text-center"> <h2 className="text-2xl font-bold">Memories</h2> </div>
            <div className="p-6 max-h-[300px] overflow-y-auto space-y-4"> 
              {specialDates.map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"> 
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{d.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm">{d.title}</h4>
                      <p className="text-[10px] text-gray-400">{d.date}</p>
                    </div>
                  </div> 
                </div>
              ))} 
            </div>
            <div className="p-6 bg-gray-50 flex gap-4">
              <button onClick={() => setShowSpecialDates(false)} className="flex-1 h-12 rounded-2xl bg-white border font-bold text-sm">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showLogoutConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xs text-center">
            <h3 className="text-xl font-bold mb-2">Logout?</h3>
            <p className="text-gray-500 text-sm mb-8">Are you sure you want to logout from SevaSansaar?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-2xl bg-gray-100 font-bold">Cancel</button>
              <button onClick={handleLogout} className="flex-1 h-12 rounded-2xl bg-rose-500 text-white font-bold">Logout</button>
            </div>
          </div>
        </motion.div>
      )}

      {showClearConfirm && (
        <div className="absolute inset-0 z-[200] flex items-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowClearConfirm(false)} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="relative w-full bg-white rounded-t-[3rem] p-10 flex flex-col gap-8 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500"><Trash2 size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900">Clear Chat?</h3>
              <p className="text-gray-500 text-sm">This will clear chat only for you. This cannot be undone.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleClearChat} className="w-full h-16 bg-rose-500 rounded-3xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20">Yes, Clear Chat</button>
              <button onClick={() => setShowClearConfirm(false)} className="w-full h-16 bg-gray-50 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-xs">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {showWallpaperSheet && (
        <div className="absolute inset-0 z-[200] flex items-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowWallpaperSheet(false)} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="relative w-full bg-white rounded-t-[3rem] p-10 flex flex-col gap-8 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Preset Gradients</p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    'linear-gradient(135deg, #0f172a 0%, #000000 100%)',
                    'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
                    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                    'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'
                  ].map((g, i) => (
                    <button 
                      key={i} 
                      onClick={() => setPresetWallpaper(g)}
                      className="w-20 h-20 rounded-2xl shrink-0 border-2 border-transparent hover:border-indigo-500 transition-all overflow-hidden"
                      style={{ background: g }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Custom Wallpaper</p>
                <label className="w-full h-32 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => isOpeningSystemUI.current = true}>
                  <Camera size={24} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-xs font-bold text-gray-400">Tap to upload image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => { isOpeningSystemUI.current = false; handleWallpaperUpload(e); }} />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={removeWallpaper} className="w-full h-16 bg-gray-50 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-xs">Remove Wallpaper</button>
              <button onClick={() => setShowWallpaperSheet(false)} className="w-full h-16 bg-gray-900 rounded-3xl text-white font-black uppercase tracking-widest text-xs">Done</button>
            </div>
          </motion.div>
        </div>
      )}

      {showSetup && currentUser && <PINSetup onComplete={() => setShowSetup(false)} userId={currentUser.id} />}
    </AnimatePresence>
  );
};
