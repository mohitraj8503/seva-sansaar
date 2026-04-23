"use client";

import React, { useState, useEffect } from 'react';
import { Palette, Moon, Sun, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1', key: 'indigo' },
  { name: 'Rose', value: '#f43f5e', key: 'rose' },
  { name: 'Violet', value: '#8b5cf6', key: 'violet' },
  { name: 'Teal', value: '#14b8a6', key: 'teal' },
  { name: 'Amber', value: '#f59e0b', key: 'amber' },
  { name: 'Slate', value: '#64748b', key: 'slate' },
];

export const AppearanceSettings = ({ user, onUpdate }: { user: Profile, onUpdate: (data: Partial<Profile>) => void }) => {
  const [theme, setTheme] = useState(user.theme || 'dark');
  const [accent, setAccent] = useState(user.accent_color || 'indigo');
  const supabase = createClient();

  useEffect(() => {
    const savedAccent = localStorage.getItem('connectia_accent_color') || 'indigo';
    setAccent(savedAccent);
    document.documentElement.style.setProperty('--accent', ACCENT_COLORS.find(c => c.key === savedAccent)?.value || '#6366f1');
  }, []);

  const toggleTheme = async () => {
    if (!user?.id) {
      console.error("UPDATE ERROR: User ID is missing");
      return;
    }
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const { error } = await supabase.from('profiles').update({ theme: newTheme }).eq('id', user.id);
    if (error) {
      console.error("UPDATE THEME ERROR:", error);
    } else {
      onUpdate({ ...user, theme: newTheme });
    }
  };

  const changeAccent = async (color: { key: string; value: string }) => {
    if (!user?.id) {
      console.error("UPDATE ERROR: User ID is missing");
      return;
    }
    setAccent(color.key);
    localStorage.setItem('connectia_accent_color', color.key);
    document.documentElement.style.setProperty('--accent', color.value);
    const { error } = await supabase.from('profiles').update({ accent_color: color.key }).eq('id', user.id);
    if (error) {
      console.error("UPDATE ACCENT ERROR:", error);
    }
  };

  return (
    <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
      <div className="flex items-center gap-3">
        <Palette size={20} className="text-indigo-500" />
        <h3 className="text-lg font-bold text-white">Appearance</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-400" />}
          <span className="text-sm font-bold text-white/80">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-12 h-6 bg-white/10 rounded-full relative transition-colors"
        >
          <motion.div 
            animate={{ x: theme === 'dark' ? 24 : 4 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
          />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Accent Color</p>
        <div className="flex justify-between">
          {ACCENT_COLORS.map((c) => (
            <button 
              key={c.key} 
              onClick={() => changeAccent(c)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative"
              style={{ backgroundColor: c.value }}
            >
              {accent === c.key && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import { motion } from 'framer-motion';
