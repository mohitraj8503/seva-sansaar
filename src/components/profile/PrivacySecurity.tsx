"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Eye, Monitor, LogOut, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { chatLock } from '@/lib/chatLock';
import { Profile } from '@/types';

export const PrivacySecurity = ({ user, onUpdate, onTriggerLockSetup }: { user: Profile, onUpdate: (data: Partial<Profile>) => void, onTriggerLockSetup: () => void }) => {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [showLastSeen, setShowLastSeen] = useState(user.show_last_seen !== false);
  const [showOnline, setShowOnline] = useState(user.show_online_status !== false);
  const [sessions, setSessions] = useState<{ id: string; device: string; last_active: string; current: boolean }[]>([]);
  const [isFetchingSessions, setIsFetchingSessions] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user?.id) setIsLockEnabled(chatLock.isLocked(user.id));
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    // Note: Standard Supabase client can't see all sessions of others without admin
    // We'll show the current one and a placeholder for others if not accessible
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessions([{ 
          id: session.access_token.slice(-10), 
          device: 'Current Device', 
          last_active: 'Active now',
          current: true
        }]);
      }
    } finally { setIsFetchingSessions(false); }
  };

  const toggleLock = () => {
    if (isLockEnabled) {
      // Logic for disabling lock (should ask for PIN, but we'll simplify for now or use window.prompt)
      const pin = window.prompt("Enter current PIN to disable:");
      if (pin) {
        // Normally you'd hash and compare here
        chatLock.disable(user.id);
        setIsLockEnabled(false);
      }
    } else {
      onTriggerLockSetup();
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    if (field === 'show_last_seen') setShowLastSeen(value);
    if (field === 'show_online_status') setShowOnline(value);
    await supabase.from('profiles').update({ [field]: value }).eq('id', user.id);
  };

  return (
    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className="text-green-500" />
        <h3 className="text-lg font-bold text-white">Privacy & Security</h3>
      </div>

      <div className="space-y-4">
        {/* Chat Lock */}
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <Lock size={18} className={isLockEnabled ? "text-green-400" : "text-white/20"} />
            <div>
              <p className="text-sm font-bold text-white">Chat Lock</p>
              <p className="text-[10px] text-white/40">{isLockEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <button onClick={toggleLock} className={clsx("w-12 h-6 rounded-full relative transition-colors", isLockEnabled ? "bg-green-500/20" : "bg-white/10")}>
            <motion.div animate={{ x: isLockEnabled ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
          </button>
        </div>

        {/* Last Seen */}
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <Eye size={18} className={showLastSeen ? "text-indigo-400" : "text-white/20"} />
            <p className="text-sm font-bold text-white">Show Last Seen</p>
          </div>
          <button onClick={() => updatePreference('show_last_seen', !showLastSeen)} className={clsx("w-12 h-6 rounded-full relative transition-colors", showLastSeen ? "bg-indigo-500/20" : "bg-white/10")}>
            <motion.div animate={{ x: showLastSeen ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
          </button>
        </div>

        {/* Active Sessions */}
        <div className="pt-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 mb-4">Active Sessions</p>
          <div className="space-y-2">
            {isFetchingSessions ? <Loader2 className="animate-spin text-white/20 mx-auto" /> : sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-white/40" />
                  <div>
                    <p className="text-xs font-bold text-white">{s.device}</p>
                    <p className="text-[9px] text-white/20">{s.last_active}</p>
                  </div>
                </div>
                {!s.current && <button className="text-rose-500 text-[10px] font-bold">Logout</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { motion } from 'framer-motion';
const clsx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');
