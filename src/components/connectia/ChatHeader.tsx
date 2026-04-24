import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronUp, ChevronDown, Phone, Video, MoreVertical, 
  Search, X, ImageIcon, Calendar, Star, Lock, Trash2, Download, 
  Volume2, VolumeX
} from 'lucide-react';
import Image from "next/image";
import { clsx } from 'clsx';
import { Profile } from '@/types';
import { chatLock } from '@/lib/chatLock';

interface ChatHeaderProps {
  activePartner: Profile | null;
  onlineUsers: string[];
  setView: (v: 'list' | 'calls' | 'details') => void;
  setActiveCall: (c: { type: 'outgoing' | 'incoming', target: Profile } | null) => void;
  showMenu: boolean;
  setShowMenu: (s: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (s: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: string[];
  searchIndex: number;
  setSearchIndex: (i: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  expiryTime: number | null;
  setExpiryTime: (t: number | null) => void;
  setToast: (msg: string | null) => void;
  setShowMediaGallery: (s: boolean) => void;
  setShowSpecialDates: (s: boolean) => void;
  setShowStarred: (s: boolean) => void;
  setShowSetup: (s: boolean) => void;
  setShowWallpaperSheet: (s: boolean) => void;
  setShowClearConfirm: (s: boolean) => void;
  handleExportChat: () => void;
  currentUser: Profile | null;
}

export const ChatHeader = ({
  activePartner, onlineUsers, setView, setActiveCall,
  showMenu, setShowMenu,
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, searchResults, searchIndex, setSearchIndex,
  isMuted, setIsMuted,
  expiryTime, setExpiryTime,
  setToast, setShowMediaGallery, setShowSpecialDates, setShowStarred,
  setShowSetup, setShowWallpaperSheet, setShowClearConfirm,
  handleExportChat, currentUser
}: ChatHeaderProps) => {
  return (
    <div className="flex flex-col w-full">
      <header className="h-[90px] px-4 md:px-8 bg-white/80 backdrop-blur-2xl border-b border-gray-100/50 flex items-center justify-between sticky top-0 z-[70] safe-top">
        <div className="flex items-center gap-5">
           <div 
             onClick={() => setView('list')} 
             className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-black active:scale-90 transition-all md:hidden"
           >
             <ChevronLeft size={24} />
           </div>
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 relative shadow-sm">
                 <Image 
                   src={activePartner?.avatar_url || "/default-avatar.png"} 
                   alt={activePartner?.name || ""} 
                   fill 
                   className="object-cover" 
                 />
              </div>
              <div className="flex flex-col">
                 <h3 className="text-black font-black text-lg tracking-tight leading-tight">
                   {activePartner?.name}
                 </h3>
                 <p className={clsx(
                   "text-[10px] font-bold uppercase tracking-[0.2em]", 
                   onlineUsers.includes(activePartner?.id || '') ? "text-green-500" : "text-gray-300"
                 )}>
                   {onlineUsers.includes(activePartner?.id || '') ? 'Online' : 'Offline'}
                 </p>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
             <Search size={22} />
          </button>
          <button 
            onClick={() => activePartner && setActiveCall({ type: 'outgoing', target: activePartner })}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
          >
            <Phone size={22} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all">
             <Video size={22} />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
            aria-label="Menu"
          >
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }} 
            className="absolute right-6 top-24 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-[80] min-w-[180px]"
          >
            <button onClick={() => { setIsSearchOpen(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Search size={16} /> Search in Chat</button>
            <button onClick={() => { setShowMediaGallery(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><ImageIcon size={16} /> View Media</button>
            <button onClick={() => { setShowSpecialDates(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Calendar size={16} /> Memories</button>
            <button onClick={() => { setShowStarred(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Star size={16} /> Starred Messages</button>
            <button onClick={() => { setIsMuted(!isMuted); localStorage.setItem('sevasansaar_muted', !isMuted ? '1' : ''); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50">{isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />} {isMuted ? 'Unmute' : 'Mute'}</button>
            <button onClick={() => { handleExportChat(); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Download size={16} /> Export Chat</button>
            <button onClick={() => { if(currentUser && chatLock.isLocked(currentUser.id)) chatLock.disable(currentUser.id); else setShowSetup(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Lock size={16} /> {currentUser && chatLock.isLocked(currentUser.id) ? 'Disable Lock' : 'Lock Chat'}</button>
            <button onClick={() => { setShowWallpaperSheet(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><ImageIcon size={16} /> Chat Wallpaper</button>
            <button onClick={() => { setShowClearConfirm(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-rose-500 font-bold border-b border-gray-50"><Trash2 size={16} /> Clear Chat</button>
            <div className="bg-gray-50/50 p-2 px-5 flex flex-col gap-2">
               <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">Disappearing Messages {expiryTime ? <span className="text-indigo-600">• ON</span> : <span className="text-gray-300">• OFF</span>}</p>
               <div className="flex gap-2 pb-1">
                  {[null, 300, 3600, 86400].map(val => (
                    <button 
                      key={val === null ? 'off' : val} 
                      onClick={() => { setExpiryTime(val); setShowMenu(false); setToast(val ? `Messages will disappear after ${val >= 3600 ? val/3600 + 'h' : val/60 + 'm'}` : "Disappearing messages disabled"); }}
                      className={clsx(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all",
                        expiryTime === val ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-500 border border-gray-100 hover:border-indigo-200"
                      )}
                    >
                      {val === null ? 'OFF' : val >= 3600 ? val/3600 + 'H' : val/60 + 'M'}
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSearchOpen && (
        <div className="bg-black p-4 flex items-center gap-3 border-b border-white/5 sticky top-[90px] z-[60]">
          <div className="flex-1 bg-white/5 rounded-full px-4 py-2 flex items-center gap-2">
            <Search size={16} className="text-white/30" />
            <input 
              autoFocus 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search messages..." 
              className="bg-transparent text-sm text-white outline-none flex-1" 
            />
            {searchResults.length > 0 && (
              <span className="text-[10px] font-bold text-white/30 uppercase">
                {searchIndex + 1} of {searchResults.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const nextIdx = (searchIndex - 1 + searchResults.length) % searchResults.length;
                setSearchIndex(nextIdx);
                const msgId = searchResults[nextIdx];
                document.querySelector(`[data-msg-id="${msgId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }} 
              className="text-white/30 hover:text-white"
            >
              <ChevronUp size={20} />
            </button>
            <button 
              onClick={() => {
                const nextIdx = (searchIndex + 1) % searchResults.length;
                setSearchIndex(nextIdx);
                const msgId = searchResults[nextIdx];
                document.querySelector(`[data-msg-id="${msgId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }} 
              className="text-white/30 hover:text-white"
            >
              <ChevronDown size={20} />
            </button>
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="text-white/30 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
