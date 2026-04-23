"use client";

import React, { useState } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';

// Profile interface moved to @/types

export const ProfileInfo = ({ user, onUpdate }: { user: Profile, onUpdate: (data: Profile) => void }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value || "");
  };

  const handleSave = async (field: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ [field]: tempValue }).eq('id', user.id);
      if (error) throw error;
      onUpdate({ ...user, [field]: tempValue });
      setEditingField(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 mt-10">
      {/* Display Name */}
      <div className="text-center group">
        {editingField === 'name' ? (
          <div className="flex flex-col items-center gap-3" style={{ transform: 'translateZ(0)' }}>
            <input 
              autoFocus
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-2xl font-bold text-white text-center outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <div className="flex gap-4">
              <button onClick={() => handleSave('name')} className="p-3 bg-green-500 rounded-full text-white shadow-lg active:scale-90 transition-all touch-manipulation">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}</button>
              <button onClick={() => setEditingField(null)} className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-all touch-manipulation"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 cursor-pointer group p-2 touch-manipulation" onClick={() => handleEdit('name', user.name)}>
            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
            <Edit2 size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
          </div>
        )}
      </div>

      {/* Bio Section */}
      <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5" style={{ transform: 'translateZ(0)' }}>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">About Me</p>
        {editingField === 'bio' ? (
          <div className="space-y-4">
            <textarea 
              autoFocus
              maxLength={120}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] resize-none transition-all"
              placeholder="Tell something about yourself..."
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/20">{tempValue.length}/120</span>
              <div className="flex gap-3">
                <button onClick={() => setEditingField(null)} className="px-6 py-2.5 bg-white/10 rounded-full text-xs font-bold text-white active:scale-95 transition-all touch-manipulation">Cancel</button>
                <button onClick={() => handleSave('bio')} className="px-6 py-2.5 bg-indigo-600 rounded-full text-xs font-bold text-white flex items-center gap-2 active:scale-95 transition-all shadow-lg touch-manipulation">{isSaving && <Loader2 size={12} className="animate-spin" />} Save</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 cursor-pointer p-1 touch-manipulation" onClick={() => handleEdit('bio', user.bio || "")}>
            <p className={user.bio ? "text-white/80 text-sm leading-relaxed" : "text-white/20 text-sm italic"}>
              {user.bio || "Add a bio..."}
            </p>
            <Edit2 size={14} className="text-white/20 mt-1 shrink-0" />
          </div>
        )}
      </div>

      {/* Muted Info */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{user.email}</p>
        <p className="text-white/10 text-[9px] font-bold uppercase tracking-widest">
          Member since {new Date(user.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};
