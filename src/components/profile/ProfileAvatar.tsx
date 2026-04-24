"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';
import { clsx } from 'clsx';

export const ProfileAvatar = ({ user, onUpdate }: { user: Profile, onUpdate: (url: string) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Image compression logic can be added here too if needed
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setUploadProgress(100);
      
      // Give Supabase a moment to settle
      setTimeout(() => {
        onUpdate(publicUrl);
        setIsUploading(false);
        setUploadProgress(0);
      }, 800);

    } catch (err: unknown) {
      console.error("AVATAR UPDATE FAILED:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to update profile picture: " + message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = async () => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      if (error) {
        console.error("REMOVE PHOTO ERROR:", error);
        return;
      }
      onUpdate("");
      setShowOptions(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative group">
      <div 
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 relative cursor-pointer tap-scale"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
        onContextMenu={(e) => { e.preventDefault(); setShowOptions(true); }}
        onClick={() => setShowOptions(true)}
      >
        <Image 
          src={user.avatar_url || "/default-avatar.png"} 
          alt={user.name || "User Avatar"}
          fill
          className={clsx("object-cover transition-transform duration-200 ease-out group-hover:scale-110", isUploading && "opacity-50 blur-sm")} 
        />
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <Loader2 className="text-white animate-spin mb-1" size={20} />
            <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => { window.dispatchEvent(new CustomEvent('picking_file')); fileInputRef.current?.click(); }}
        className="absolute bottom-1 right-1 bg-indigo-600 p-3 rounded-full border-4 border-black text-white tap-scale transition-all shadow-lg touch-manipulation"
      >
        <Camera size={16} />
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*" 
      />

      <AnimatePresence>
        {showOptions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOptions(false)}
          >
            <div className="bg-white rounded-[2rem] overflow-hidden w-full max-w-[280px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Profile Photo</h3>
              </div>
              <div className="flex flex-col py-2">
                <button onClick={() => { window.dispatchEvent(new CustomEvent('picking_file')); fileInputRef.current?.click(); setShowOptions(false); }} className="px-6 py-4 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700">
                  <Camera size={20} className="text-indigo-600" /> Change Photo
                </button>
                <button onClick={removePhoto} className="px-6 py-4 hover:bg-rose-50 flex items-center gap-4 text-sm font-bold text-rose-500">
                  <Trash2 size={20} /> Remove Photo
                </button>
                <button onClick={() => setShowOptions(false)} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 mt-2">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
