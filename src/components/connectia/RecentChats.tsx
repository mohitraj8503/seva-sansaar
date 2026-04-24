import React from 'react';
import { Bell, Plus, Archive, MoreVertical } from 'lucide-react';
import Image from "next/image";
import { clsx } from 'clsx';
import { Profile, Message } from '@/types';
import { formatMsgTime } from '@/utils/connectia/helpers';
import { ChatView } from '@/store/useChatStore';

interface RecentChatsProps {
  chatProfiles: Profile[];
  activePartner: Profile | null;
  setActivePartner: (u: Profile) => void;
  view: string;
  setView: (v: ChatView) => void;
  setOpenTabs: React.Dispatch<React.SetStateAction<string[]>>;
  lastMessages: Record<string, Message>;
  unreadCounts: Record<string, number>;
  onlineUsers: string[];
  isLoading: boolean;
}

const ChatSkeleton = () => (
  <div className="flex items-center gap-4 p-3 animate-pulse">
    <div className="w-14 h-14 bg-white/5 rounded-full shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="flex justify-between">
        <div className="h-3 bg-white/10 rounded-full w-1/3" />
        <div className="h-2 bg-white/5 rounded-full w-1/6" />
      </div>
      <div className="h-3 bg-white/5 rounded-full w-2/3" />
    </div>
  </div>
);

export const RecentChats = ({
  chatProfiles, activePartner, setActivePartner, view, setView, setOpenTabs,
  lastMessages, unreadCounts, onlineUsers, isLoading
}: RecentChatsProps) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      <header className="p-6 md:p-8 pt-safe flex flex-col gap-6 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
              Connectia
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight">Messages</h1>
          </div>
          <div className="flex gap-2">
            <button 
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            <button 
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Active Now</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
             <button 
              className="flex flex-col items-center gap-2 shrink-0 group"
              aria-label="Add to story"
             >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/40 group-active:scale-95 transition-all">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">Add</span>
             </button>
             {chatProfiles.map(u => (
               <button 
                key={u.id} 
                className="flex flex-col items-center gap-2 shrink-0 group" 
                onClick={() => { 
                  navigator.vibrate?.(10);
                  setActivePartner(u); 
                  setView('chat'); 
                }}
                aria-label={`Open story of ${u.name}`}
               >
                  <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-indigo-500/50 group-active:scale-95 transition-all">
                     <div className="relative w-full h-full rounded-full overflow-hidden">
                       <Image src={u.avatar_url || "/default-avatar.png"} fill className="object-cover" alt="" />
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-tight truncate w-16">{u.name.split(' ')[0]}</span>
               </button>
             ))}
          </div>
        </div>
      </header>

      <div className="flex-1 bg-[var(--bg-secondary)] rounded-t-[2.5rem] p-6 md:p-8 overflow-y-auto scrollbar-hide border-t border-white/5">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-white text-lg font-bold">Recent</h2>
           <button 
             className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all"
             aria-label="Archive"
           >
             <Archive size={18} />
           </button>
        </div>
        
        <div className="space-y-1">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <ChatSkeleton key={i} />)
          ) : (
            chatProfiles.map(u => (
              <div 
                key={u.id} 
                onClick={() => { 
                  navigator.vibrate?.(10);
                  setActivePartner(u); 
                  setView('chat'); 
                  setOpenTabs(prev => prev.includes(u.id) ? prev : [...prev, u.id]);
                }} 
                className={clsx(
                  "flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer group active:bg-white/5",
                  activePartner?.id === u.id && view === 'chat' ? "bg-white/5" : "hover:bg-white/5"
                )}
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/5">
                   <Image src={u.avatar_url || "/default-avatar.png"} alt={u.name} fill className="object-cover" />
                   {onlineUsers.includes(u.id) && (
                     <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--bg-secondary)]" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{u.name}</h3>
                      <span className="text-[10px] font-bold text-white/20 uppercase">
                        {formatMsgTime(lastMessages[u.id]?.created_at || new Date().toISOString())}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-sm truncate text-white/40 font-medium">
                        {lastMessages[u.id]?.text || "Start a conversation..."}
                      </p>
                      {unreadCounts[u.id] > 0 && (
                        <div className="min-w-[18px] h-[18px] px-1.5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                          {unreadCounts[u.id]}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
