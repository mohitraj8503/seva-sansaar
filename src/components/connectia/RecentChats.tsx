import React from 'react';
import { Bell, Plus, Archive } from 'lucide-react';
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
  currentUser: Profile | null;
  isLoading: boolean;
}

const ChatSkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-14 h-14 bg-gray-100 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

export const RecentChats = ({
  chatProfiles, activePartner, setActivePartner, view, setView, setOpenTabs,
  lastMessages, unreadCounts, onlineUsers, currentUser, isLoading
}: RecentChatsProps) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
      <header className="p-8 pt-safe pb-8 flex flex-col gap-8 shrink-0 bg-black">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-amber-200/60 text-xs font-medium mb-1">
              Welcome {currentUser?.name?.split(' ')[0] || 'User'} 👋
            </p>
            <h1 className="text-[34px] font-black text-white tracking-tight">Connectia</h1>
          </div>
          <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/80 transition-all active:scale-90">
            <Bell size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Story</h3>
            <button className="text-white/40 text-xs font-bold">See All</button>
          </div>
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
             <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 active:border-white/40 transition-all">
                  <Plus size={28} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Add Story</span>
             </div>
             {chatProfiles.map(u => (
               <div 
                key={u.id} 
                className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer" 
                onClick={() => { setActivePartner(u); setView('chat'); }}
               >
                  <div className="relative w-[72px] h-[72px] rounded-full p-1 border-2 border-amber-200/30">
                     <div className="relative w-full h-full rounded-full overflow-hidden">
                       <Image src={u.avatar_url || "/default-avatar.png"} fill className="object-cover" alt="" />
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{u.name.split(' ')[0]}</span>
               </div>
             ))}
          </div>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-t-[3.5rem] p-8 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-black text-[24px] font-black">Recent Chat</h2>
           <button className="flex items-center gap-2 bg-[#fdf8e6] px-4 py-2 rounded-xl text-[10px] font-bold text-black border border-black/5">
             <Archive size={14} /> Archive Chat
           </button>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <ChatSkeleton key={i} />)
          ) : (
            chatProfiles.map(u => (
              <div 
                key={u.id} 
                onClick={() => { 
                  setActivePartner(u); 
                  setView('chat'); 
                  setOpenTabs(prev => prev.includes(u.id) ? prev : [...prev, u.id]);
                }} 
                className={clsx(
                  "flex items-center gap-5 py-4 border-b border-gray-50 active:bg-gray-50/50 rounded-3xl transition-all cursor-pointer group",
                  activePartner?.id === u.id && view === 'chat' ? "bg-gray-50" : ""
                )}
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm">
                   <Image src={u.avatar_url || "/default-avatar.png"} alt={u.name} fill className="object-cover" />
                   {onlineUsers.includes(u.id) && (
                     <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-4 border-white" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <h3 className="font-black text-black text-base group-hover:text-indigo-600 transition-colors">{u.name}</h3>
                      <span className="text-[10px] font-bold text-black/30">
                        {formatMsgTime(lastMessages[u.id]?.created_at || new Date().toISOString())}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-sm truncate text-black/40 font-medium">
                        {lastMessages[u.id]?.text || "Start a conversation..."}
                      </p>
                      {unreadCounts[u.id] > 0 ? (
                        <div className="min-w-[18px] h-[18px] px-1.5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                          {unreadCounts[u.id]}
                        </div>
                      ) : (
                        <div className="w-2 h-2 bg-black/10 rounded-full" />
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
