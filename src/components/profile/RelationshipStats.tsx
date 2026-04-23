"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Plus, MessageCircle, ImageIcon, Mic } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SpecialDate {
  id: string;
  title: string;
  date: string;
  emoji: string;
}

export const RelationshipStats = () => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [daysTogether, setDaysTogether] = useState(0);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [memoryStats, setMemoryStats] = useState({ total: 0, images: 0, audio: 0 });
  const supabase = createClient();

  const fetchSpecialDates = React.useCallback(async () => {
    const { data } = await supabase.from('special_dates').select('*').order('date', { ascending: true });
    if (data) setSpecialDates(data);
  }, [supabase]);

  const fetchMemoryStats = React.useCallback(async () => {
    const { count: total } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    const { count: images } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('type', 'image');
    const { count: audio } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('type', 'audio');
    setMemoryStats({ total: total || 0, images: images || 0, audio: audio || 0 });
  }, [supabase]);

  useEffect(() => {
    const saved = localStorage.getItem('connectia_start_date');
    if (saved) {
      setStartDate(saved);
      const diff = Math.floor((Date.now() - new Date(saved).getTime()) / (1000 * 60 * 60 * 24));
      setDaysTogether(diff);
    }
    fetchSpecialDates();
    fetchMemoryStats();
  }, [fetchSpecialDates, fetchMemoryStats]);

  const handleSetStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setStartDate(date);
    localStorage.setItem('connectia_start_date', date);
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    setDaysTogether(diff);
  };

  return (
    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-rose-500 fill-rose-500" />
          <h3 className="text-lg font-bold text-white">Our Story</h3>
        </div>
        <input 
          type="date" 
          id="start-date"
          className="hidden" 
          onChange={handleSetStartDate}
        />
        <label htmlFor="start-date" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white cursor-pointer"><Calendar size={16} /></label>
      </div>

      {/* Days Together Counter */}
      <div className="text-center py-6 bg-gradient-to-br from-indigo-600/20 to-rose-600/20 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-500/10 blur-3xl rounded-full" />
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-2">Together for</p>
        <h4 className="text-4xl font-black text-white mb-1">{daysTogether} <span className="text-lg font-bold text-white/40">days</span></h4>
        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Since {startDate ? new Date(startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Setting up...'}</p>
      </div>

      {/* Memory Counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/20 p-4 rounded-2xl text-center">
          <MessageCircle size={16} className="mx-auto mb-2 text-indigo-400" />
          <p className="text-lg font-bold text-white">{memoryStats.total}</p>
          <p className="text-[8px] font-bold text-white/20 uppercase">Messages</p>
        </div>
        <div className="bg-black/20 p-4 rounded-2xl text-center">
          <ImageIcon size={16} className="mx-auto mb-2 text-amber-400" />
          <p className="text-lg font-bold text-white">{memoryStats.images}</p>
          <p className="text-[8px] font-bold text-white/20 uppercase">Photos</p>
        </div>
        <div className="bg-black/20 p-4 rounded-2xl text-center">
          <Mic size={16} className="mx-auto mb-2 text-rose-400" />
          <p className="text-lg font-bold text-white">{memoryStats.audio}</p>
          <p className="text-[8px] font-bold text-white/20 uppercase">Voice</p>
        </div>
      </div>

      {/* Special Dates List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Special Dates</p>
          <button className="text-indigo-400"><Plus size={16} /></button>
        </div>
        <div className="space-y-2">
          {specialDates.map(d => (
            <div key={d.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{d.emoji || '✨'}</span>
                <div>
                  <p className="text-xs font-bold text-white">{d.title}</p>
                  <p className="text-[9px] text-white/20">{d.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-indigo-400">Next In</p>
                <p className="text-xs font-bold text-white">42 Days</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
