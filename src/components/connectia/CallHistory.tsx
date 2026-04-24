import React from 'react';
import { Phone, Video, Star, SquarePen } from 'lucide-react';
import Image from "next/image";
import { clsx } from 'clsx';
import { Call, Profile } from '@/types';
import { formatMsgTime } from '@/utils/connectia/helpers';
import { ChatView } from '@/store/useChatStore';

interface CallHistoryProps {
  recentCalls: Call[];
  setView?: (v: ChatView) => void;
  setActivePartner?: (u: Profile) => void;
  setActiveCall?: (c: { type: 'outgoing' | 'incoming', target: Profile, call?: Call } | null) => void;
  view?: string;
}

export const CallHistory = ({ recentCalls }: CallHistoryProps) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      <header className="p-8 pt-12 safe-top flex flex-col gap-6 shrink-0">
        <div className="flex justify-between items-center">
           <div className="flex flex-col">
              <h1 className="text-[34px] font-black text-white tracking-tight">Calls</h1>
              <p className="text-amber-200/60 text-xs font-medium">Recent Activity</p>
           </div>
           <div className="flex gap-3">
              <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/80"><Star size={20} /></button>
              <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/80"><SquarePen size={20} /></button>
           </div>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-t-[3.5rem] p-8 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          {recentCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <Phone size={32} />
               </div>
               <h3 className="text-black font-black">No Recent Calls</h3>
               <p className="text-gray-400 text-xs mt-2">Your call history will appear here.</p>
            </div>
          ) : (
            recentCalls.map(call => (
              <div 
                key={call.id} 
                className="flex items-center gap-5 py-4 border-b border-gray-50 active:bg-gray-50/50 rounded-3xl transition-all cursor-pointer group"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm">
                   <Image src="/default-avatar.png" alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <h3 className="font-black text-black text-base group-hover:text-indigo-600 transition-colors">
                        {call.type === 'video' ? 'Video Call' : 'Voice Call'}
                      </h3>
                      <span className="text-[10px] font-bold text-black/30">{formatMsgTime(call.created_at)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        call.status === 'accepted' ? "text-green-500" : "text-rose-500"
                      )}>
                        {call.type === 'video' ? <Video size={10} /> : <Phone size={10} />}
                      </div>
                      <p className="text-sm truncate text-black/40 font-medium capitalize">{call.status}</p>
                   </div>
                </div>
                <button className="w-12 h-12 flex items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-50 transition-colors">
                   <Phone size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
