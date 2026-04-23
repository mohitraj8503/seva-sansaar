"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, Send, Inbox, Image as ImageIcon, Mic } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Stats {
  sent: number;
  received: number;
  images: number;
  voice: number;
  firstDate?: string;
  activeHour: string;
}

export const ChatStats = React.memo(({ user }: { user: { id: string } }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: sent } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', user.id);
      const { count: received } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id);
      const { count: images } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', user.id).eq('type', 'image');
      const { count: voice } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', user.id).eq('type', 'audio');
      const { data: firstMsg } = await supabase.from('messages').select('created_at').order('created_at', { ascending: true }).limit(1).single();

      setStats({
        sent: sent ?? 0,
        received: received ?? 0,
        images: images ?? 0,
        voice: voice ?? 0,
        firstDate: firstMsg?.created_at,
        activeHour: '10 PM' // Placeholder for complex aggregation
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id]);

  if (loading) return <div className="p-8 text-center text-white/20 font-bold uppercase text-[10px] tracking-widest animate-pulse">Analyzing stats...</div>;

  const metricCards = [
    { label: 'Sent', value: stats?.sent || 0, icon: Send, color: 'text-indigo-400' },
    { label: 'Received', value: stats?.received || 0, icon: Inbox, color: 'text-green-400' },
    { label: 'Images', value: stats?.images || 0, icon: ImageIcon, color: 'text-amber-400' },
    { label: 'Voice', value: stats?.voice || 0, icon: Mic, color: 'text-rose-400' },
  ];

  return (
    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 size={20} className="text-amber-500" />
        <h3 className="text-lg font-bold text-white">Chat Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metricCards.map((m, i) => (
          <div key={i} className="bg-black/20 p-6 rounded-3xl border border-white/5">
            <m.icon size={18} className={`${m.color} mb-3`} />
            <h4 className="text-2xl font-black text-white">{m.value}</h4>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
          <Calendar size={16} className="text-white/20" />
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase">First Message</p>
            <p className="text-xs font-bold text-white">{stats?.firstDate ? new Date(stats!.firstDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '---'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
          <Clock size={16} className="text-white/20" />
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase">Peak Chat Hour</p>
            <p className="text-xs font-bold text-white">{stats?.activeHour || '---'}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
ChatStats.displayName = 'ChatStats';
