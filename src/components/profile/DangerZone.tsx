"use client";

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, Trash2, ShieldX, Database, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export const DangerZone = ({ user }: { user: { id: string } }) => {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const handleClearChat = async () => {
    if (confirm("Are you absolutely sure? This will delete your entire chat history. This cannot be undone.")) {
      await supabase.from('messages').update({ is_deleted: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      window.location.reload();
    }
  };

  const handleResetPin = () => {
    const pin = window.prompt("Enter current PIN to reset security:");
    if (pin) {
       localStorage.removeItem('chat_lock_pin_hash');
       window.location.reload();
    }
  };

  return (
    <div className="border border-rose-500/20 rounded-[2.5rem] overflow-hidden bg-rose-500/5 mt-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-rose-500" />
          <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Danger Zone</h3>
        </div>
        {isOpen ? <ChevronUp className="text-rose-500/40" /> : <ChevronDown className="text-rose-500/40" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-8 space-y-4"
          >
            <button 
              onClick={handleClearChat}
              className="w-full p-4 flex items-center gap-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors text-left group"
            >
              <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500"><Trash2 size={18} /></div>
              <div>
                <p className="text-sm font-bold text-white">Clear Chat History</p>
                <p className="text-[10px] text-white/40">Permanently delete all messages</p>
              </div>
            </button>

            <button 
              onClick={handleResetPin}
              className="w-full p-4 flex items-center gap-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors text-left group"
            >
              <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500"><ShieldX size={18} /></div>
              <div>
                <p className="text-sm font-bold text-white">Reset Security PIN</p>
                <p className="text-[10px] text-white/40">Remove the chat lock protection</p>
              </div>
            </button>

            <button 
              className="w-full p-4 flex items-center gap-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors text-left group"
            >
              <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500"><Database size={18} /></div>
              <div>
                <p className="text-sm font-bold text-white">Clear Cached Media</p>
                <p className="text-[10px] text-white/40">Free up local storage space</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
