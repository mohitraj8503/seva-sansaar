"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, CheckCheck, ChevronLeft, ArrowRight, 
  MessageCircle, Send, Plus, LogOut, Mic, Edit2,
  Loader2, Paperclip, X, Trash2, Reply, Smile, AlertCircle, Download, 
  Lock, Unlock, Image as ImageIcon, ChevronUp, ChevronDown, Heart,
  Copy, Star, Forward, Check, Camera, FileText, Play, Pause, ExternalLink, Maximize2,
  User, Bell, Phone, Settings, VolumeX, Search, Calendar, Volume2, ArrowDown, Home
} from 'lucide-react';
import Image from "next/image";
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

// --- NEW IMPORTS ---
import { chatLock } from '@/lib/chatLock';
import { Profile, Message, Call } from '@/types';
import { CallInterface } from '@/components/CallInterface';
import { PINLock } from '@/components/PINLock';
import { PINSetup } from '@/components/PINSetup';
import { sessionManager } from '@/lib/sessionManager';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { AppearanceSettings } from '@/components/profile/AppearanceSettings';
import { PrivacySecurity } from '@/components/profile/PrivacySecurity';
import { RelationshipStats } from '@/components/profile/RelationshipStats';
import { ChatStats } from '@/components/profile/ChatStats';
import { DangerZone } from '@/components/profile/DangerZone';

// --- TYPES & INTERFACES ---
// Centralized types moved to @/types

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

// --- UTILS ---
const formatMsgTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const utcStr = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`;
    const date = new Date(utcStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return "00:00"; }
};

const formatDateSeparator = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};

const extractUrl = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex)?.[0];
};

// --- COMPONENTS ---

const LinkPreview = ({ url }: { url: string }) => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!json.error) setData(json);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMetadata();
  }, [url]);

  if (loading) return <div className="mt-2 p-3 bg-white/5 rounded-xl flex items-center gap-3 animate-pulse"><div className="w-10 h-10 bg-white/10 rounded-lg" /><div className="flex-1 space-y-2"><div className="h-3 bg-white/10 rounded w-1/2" /><div className="h-2 bg-white/10 rounded w-full" /></div></div>;
  if (!data) return null;

  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="mt-2 block bg-white/10 rounded-xl overflow-hidden hover:bg-white/20 transition-colors group">
      {data.image && <div className="w-full h-32 relative"><Image src={data.image} alt="Preview" fill className="object-cover" /></div>}
      <div className="p-3">
        <h4 className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{data.title}</h4>
        {data.description && <p className="text-[9px] text-white/60 line-clamp-2 mt-1">{data.description}</p>}
        <div className="flex items-center gap-1 mt-2 text-[8px] font-bold text-white/30 uppercase tracking-widest"><ExternalLink size={8} /> {new URL(data.url).hostname}</div>
      </div>
    </a>
  );
};

const AudioPlayer = ({ src, duration }: { src: string, duration?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => { setIsPlaying(false); setProgress(0); };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      };
    }
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  return (
    <div className="flex items-center gap-3 min-w-[200px] bg-white/10 p-3 rounded-2xl">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-lg flex-shrink-0"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </button>
      <div className="flex-1 space-y-1.5">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white"
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest">
          <span>Voice Message</span>
          <span>{duration || '0:00'}</span>
        </div>
      </div>
    </div>
  );
};

const Lightbox = ({ src, onClose }: { src: string, onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 flex flex-col p-6 overflow-hidden">
    <header className="flex justify-between items-center z-10">
       <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"><X size={24} /></button>
       <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"><Download size={24} /></button>
    </header>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex-1 flex items-center justify-center">
       <div className="relative w-full h-full"><Image src={src} alt="Lightbox" fill className="object-contain" /></div>
    </motion.div>
  </motion.div>
);

const MessageBubble = memo(({ message, isMe, onReact, onReply, onDeleteMe, onDeleteEveryone, onEdit, onRetry, onCopy, onStar, onForward, onSeen, replyToMsg, isHighlighted, isStarred, hideAvatar, hideTimestamp, isFirstUnread }: { message: Message, isMe: boolean, onReact: (emoji: string) => void, onReply: () => void, onDeleteMe: () => void, onDeleteEveryone: () => void, onEdit: () => void, onRetry: () => void, onCopy: () => void, onStar: () => void, onForward: () => void, onSeen: () => void, replyToMsg?: Message, isHighlighted?: boolean, isStarred?: boolean, hideAvatar?: boolean, hideTimestamp?: boolean, isFirstUnread?: boolean }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const longPress = useLongPress(() => setShowMenu(true));
  const reactions = Object.entries(message.reactions || {});
  const canDeleteEveryone = isMe && (Date.now() - new Date(message.created_at).getTime() < 10 * 60 * 1000);
  const url = useMemo(() => extractUrl(message.text), [message.text]);

  // SEEN DETECTION
  const bubbleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isMe || message.status === 'seen') return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { onSeen(); obs.disconnect(); } }, { threshold: 0.5 });
    if (bubbleRef.current) obs.observe(bubbleRef.current);
    return () => obs.disconnect();
  }, [message.status, isMe, onSeen]);

  if (message.is_deleted) return <div className={clsx("flex flex-col max-w-[85%] mb-2", isMe ? "ml-auto items-end" : "items-start")}><div className="p-3 rounded-2xl bg-gray-100 text-gray-400 text-xs italic">This message was deleted</div></div>;

  return (
    <>
      {isFirstUnread && (
        <div className="w-full flex items-center gap-4 my-8">
           <div className="flex-1 h-px bg-indigo-500/20" />
           <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-4 py-1.5 bg-indigo-50 rounded-full">Unread messages</span>
           <div className="flex-1 h-px bg-indigo-500/20" />
        </div>
      )}
      <motion.div initial={message.isOptimistic ? { scale: 0.8, opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={clsx("flex flex-col max-w-[85%] relative", isMe ? "ml-auto items-end" : "items-start", hideAvatar ? "mb-1" : "mb-4")} data-msg-id={message.id} ref={bubbleRef}>
        <AnimatePresence>{showLightbox && <Lightbox src={message.file_url!} onClose={() => setShowLightbox(false)} />}</AnimatePresence>
        
        {replyToMsg && (
          <div className={clsx("mb-1 p-2 bg-gray-100/50 rounded-xl text-[10px] border-l-4 border-indigo-500 max-w-[200px] truncate text-gray-500 font-bold", isMe ? "mr-1 text-right" : "ml-1 text-left")}>
            <p className="text-indigo-600 uppercase text-[8px] mb-0.5">Replying to</p>
            {replyToMsg.text}
          </div>
        )}

        <div 
          {...longPress} onClick={() => { if(showMenu) setShowMenu(false); }}
          className={clsx(
            "p-3.5 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm transition-all relative cursor-pointer group", 
            isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#FFF9E0] text-black rounded-tl-none border border-black/5",
            isHighlighted && "ring-4 ring-yellow-400 ring-opacity-50 scale-105"
          )}
        >
          {message.type === 'image' && (
            <div className="relative rounded-xl overflow-hidden mb-2 max-w-[240px] group/img" onClick={() => setShowLightbox(true)}>
               <div className="relative w-full aspect-[4/3]"><Image src={message.file_url!} alt="Sent" fill className="object-cover" /></div>
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="text-white" /></div>
            </div>
          )}
          
          {message.type === 'audio' ? <AudioPlayer src={message.file_url!} duration={message.text} /> : (
            <div className="space-y-1">
              <p className="whitespace-pre-wrap">{message.text}</p>
              {url && <LinkPreview url={url} />}
            </div>
          )}

          {message.type === 'file' && (
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl min-w-[200px]">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><FileText className="text-white" /></div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold truncate text-white">{message.text}</p>
                   <p className="text-[9px] text-white/40 uppercase font-bold">Document • 2.4 MB</p>
                </div>
                <a href={message.file_url!} download className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><Download size={16} /></a>
             </div>
          )}

          {message.type === 'video' && (
             <div className="relative rounded-xl overflow-hidden mb-2 max-w-[240px]">
                <video src={message.file_url!} controls className="w-full h-auto rounded-lg" />
             </div>
          )}

          {reactions.length > 0 && <div className="absolute -bottom-2.5 right-1 flex items-center bg-white border border-gray-100 px-1.5 py-0.5 rounded-full shadow-sm scale-90">{Array.from(new Set(reactions.map(r => r[1]))).map((e, idx) => <span key={idx} className="text-[11px]">{e}</span>)}{reactions.length > 1 && <span className="text-[9px] font-bold text-gray-500 ml-0.5">{reactions.length}</span>}</div>}
          {isStarred && <Star size={10} className="absolute -top-1.5 -left-1.5 text-yellow-500 fill-yellow-500" />}

          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowMenu(false)}>
                <motion.div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[280px] flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-around p-4 bg-gray-50/50 border-b border-gray-100">
                    {["❤️", "😂", "😮", "😢", "🔥", "👍"].map(e => <button key={e} onClick={() => { onReact(e); setShowMenu(false); }} className="text-2xl hover:scale-150 transition-all active:scale-90">{e}</button>)}
                  </div>
                  <div className="flex flex-col py-2">
                    <button onClick={() => { onReply(); setShowMenu(false); }} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700"><Reply size={18} /> Reply</button>
                    <button onClick={() => { onCopy(); setShowMenu(false); }} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700"><Copy size={18} /> Copy</button>
                    <button onClick={() => { onStar(); setShowMenu(false); }} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700"><Star size={18} className={isStarred ? "fill-yellow-500 text-yellow-500" : ""} /> {isStarred ? 'Unstar' : 'Star'}</button>
                    <button onClick={() => { onForward(); setShowMenu(false); }} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700"><Forward size={18} /> Forward</button>
                    {isMe && <button onClick={() => { onEdit(); setShowMenu(false); }} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4 text-sm font-bold text-gray-700"><Edit2 size={18} /> Edit</button>}
                    <button onClick={() => { onDeleteMe(); setShowMenu(false); }} className="px-6 py-3 hover:bg-rose-50 flex items-center gap-4 text-sm font-bold text-rose-500"><Trash2 size={18} /> Delete for Me</button>
                    {canDeleteEveryone && <button onClick={() => { onDeleteEveryone(); setShowMenu(false); }} className="px-6 py-3 hover:bg-rose-50 flex items-center gap-4 text-sm font-bold text-rose-500"><AlertCircle size={18} /> Delete for Everyone</button>}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hideTimestamp && (
          <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-60">
            <span className="text-[10px] font-bold text-gray-400">{formatMsgTime(message.created_at)}</span>
            {message.edited_at && <span className="text-[9px] text-gray-400 italic">edited</span>}
            {isMe && <MessageStatusTicks status={message.status} />}
          </div>
        )}
      </motion.div>
    </>
  );
});
MessageBubble.displayName = 'MessageBubble';

const MessageStatusTicks = ({ status }: { status: 'sent' | 'delivered' | 'seen' | 'sending' | 'failed' }) => {
  if (status === 'sending') return <Loader2 size={12} className="text-gray-300 animate-spin" />;
  if (status === 'failed') return <AlertCircle size={12} className="text-rose-500" />;
  if (status === 'sent') return <CheckCheck size={14} className="text-gray-300" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-gray-500" />;
  if (status === 'seen') return <CheckCheck size={14} className="text-blue-400" />;
  return null;
};

const useLongPress = (callback: () => void, ms = 500) => {
  const timeout = useRef<NodeJS.Timeout>(); const isCanceled = useRef(false);
  const start = useCallback(() => { isCanceled.current = false; timeout.current = setTimeout(() => { if (!isCanceled.current) callback(); }, ms); }, [callback, ms]);
  const stop = useCallback(() => { isCanceled.current = true; if (timeout.current) clearTimeout(timeout.current); }, []);
  return { onMouseDown: start, onMouseUp: stop, onMouseLeave: stop, onTouchStart: start, onTouchEnd: stop };
};

const Toast = ({ message, onClear }: { message: string, onClear: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClear, 2000); return () => clearTimeout(timer); }, [onClear]);
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-[500] flex items-center gap-2 border border-white/10">
      <Check size={14} className="text-green-500" /> {message}
    </motion.div>
  );
};

interface SpecialDate {
  id: string;
  title: string;
  date: string;
  emoji: string;
}

// --- MAIN APP ---

export default function SevaSansaarApp() {
  const supabase = createClient();
  const [view, setView] = useState<'welcome' | 'list' | 'chat' | 'details' | 'calls'>('welcome');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [chatProfiles, setChatProfiles] = useState<Profile[]>([]);
  const [activePartner, setActivePartner] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  const [showMenu, setShowMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [showSpecialDates, setShowSpecialDates] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showWallpaperSheet, setShowWallpaperSheet] = useState(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    const matches = messages
      .filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(m => m.id);
    setSearchResults(matches);
    setSearchIndex(0);
  }, [searchQuery, messages]);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);

      setIsRecording(true);
      setRecordingSeconds(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found on this device.');
      } else {
        alert('Could not start recording: ' + err.message);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(false);
    setIsUploadingAudio(true);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          mediaRecorderRef.current?.stream
            .getTracks()
            .forEach(track => track.stop());

          if (audioChunksRef.current.length === 0) {
            setIsUploadingAudio(false);
            resolve();
            return;
          }

          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          if (recordingSeconds < 1) {
            setIsUploadingAudio(false);
            resolve();
            return;
          }

          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const fileName = `${currentUser?.id}/${Date.now()}.${extension}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(fileName, audioBlob, {
              contentType: mimeType,
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('Upload failed:', uploadError);
            setIsUploadingAudio(false);
            resolve();
            return;
          }

          const { data: urlData } = supabase.storage
            .from('chat-media')
            .getPublicUrl(fileName);

          const durationText = `${Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:${(recordingSeconds % 60).toString().padStart(2, '0')}`;

          await supabase.from('messages').insert({
            sender_id: currentUser?.id,
            receiver_id: activePartner?.id,
            text: durationText,
            type: 'audio',
            file_url: urlData.publicUrl,
            status: 'sent',
          });

        } catch (err) {
          console.error('Recording stop error:', err);
        } finally {
          setIsUploadingAudio(false);
          setRecordingSeconds(0);
          audioChunksRef.current = [];
          mediaRecorderRef.current = null;
          resolve();
        }
      };

      mediaRecorderRef.current!.stop();
    });
  };

  const handleClearChat = async () => {
    if (!currentUser || !activePartner) return;
    setIsLoading(true);
    try {
      // Note: We use .or to get all messages in the conversation
      const { error } = await supabase.rpc('append_deleted_by', { 
        user_id: currentUser.id,
        partner_id: activePartner.id 
      });

      if (error) throw error;

      setMessages([]);
      setToast("Chat cleared");
    } catch (err) {
      console.error(err);
      setToast("Failed to clear chat");
    } finally {
      setIsLoading(false);
      setShowClearConfirm(false);
    }
  };

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToast("Image must be under 10MB");
      return;
    }

    setToast("Uploading wallpaper...");
    try {
      const path = `${currentUser?.id}/wallpaper/wallpaper.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
      const url = urlData.publicUrl;

      setWallpaperUrl(url);
      setWallpaper(null);
      localStorage.setItem('connectia_wallpaper_url', url);
      localStorage.removeItem('connectia_wallpaper');
      setToast("Wallpaper updated");
    } catch (err) {
      console.error(err);
      setToast("Upload failed");
    }
  };

  const setPresetWallpaper = (gradient: string) => {
    setWallpaper(gradient);
    setWallpaperUrl(null);
    localStorage.setItem('connectia_wallpaper', gradient);
    localStorage.removeItem('connectia_wallpaper_url');
    setToast("Wallpaper applied");
  };

  const removeWallpaper = () => {
    setWallpaper(null);
    setWallpaperUrl(null);
    localStorage.removeItem('connectia_wallpaper');
    localStorage.removeItem('connectia_wallpaper_url');
    setToast("Wallpaper removed");
  };

  // --- NEW UX STATES ---
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isOpeningSystemUI = useRef(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Calling States
  const [activeCall, setActiveCall] = useState<{ type: 'outgoing' | 'incoming', target: Profile, call?: Call } | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Initial Wallpaper Load
    const savedWallpaper = localStorage.getItem('connectia_wallpaper');
    const savedWallpaperUrl = localStorage.getItem('connectia_wallpaper_url');
    if (savedWallpaper) setWallpaper(savedWallpaper);
    if (savedWallpaperUrl) setWallpaperUrl(savedWallpaperUrl);
  }, []);

  // --- HAPTICS ---
  const vibrate = (pattern: number | number[]) => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); };

  const [viewportHeight, setViewportHeight] = useState('100dvh');

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // --- SCROLL LOGIC ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    setShowScrollBottom(!isAtBottom && el.scrollTop > 300);
    if (isAtBottom) setUnreadCount(0);
    // Pagination detection
    if (el.scrollTop === 0 && hasMore && !isFetchingOlder) fetchOlderMessages();
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
      setUnreadCount(0);
    }
  }, []);
  const scrollToBottomRef = useRef(scrollToBottom);
  useEffect(() => { scrollToBottomRef.current = scrollToBottom; }, [scrollToBottom]);

  const showScrollBottomRef = useRef(showScrollBottom);
  useEffect(() => { showScrollBottomRef.current = showScrollBottom; }, [showScrollBottom]);

  // Force scroll to bottom on view change or messages load
  useEffect(() => {
    if (!isUnlocked || view === 'welcome' || messages.length === 0) return;
    const timer = setTimeout(() => scrollToBottom('instant'), 150);
    return () => clearTimeout(timer);
  }, [view, messages.length, scrollToBottom, isUnlocked]);

  const fetchOlderMessages = async () => {
    if (!isUnlocked || !currentUser || !activePartner || isFetchingOlder || !hasMore) return;
    setIsFetchingOlder(true);
    const oldestMsg = messages[0];
    if (!oldestMsg) { setIsFetchingOlder(false); return; }
    
    const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePartner.id}),and(sender_id.eq.${activePartner.id},receiver_id.eq.${currentUser.id})`)
      .lt('created_at', oldestMsg.created_at)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      const older = data.reverse();
      setMessages(prev => [...older, ...prev]);
      if (data.length < 30) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setIsFetchingOlder(false);
  };

  const handleTyping = (isTyping: boolean) => {
    if (isUnlocked && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser?.id, isTyping }
      });
    }
  };

  const sendMessage = useCallback(async (text: string, type: 'text' | 'image' | 'audio' | 'file' | 'video' = 'text', fileUrl?: string, retryId?: string) => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    if (!text.trim() && !fileUrl) return;
    vibrate(10);
    const tempId = retryId || crypto.randomUUID();
    if (!retryId) {
      const optimisticMessage: Message = { id: tempId, text, sender_id: currentUser.id, receiver_id: activePartner.id, type, file_url: fileUrl || null, status: 'sending', seen: false, created_at: new Date().toISOString(), reply_to: replyTo?.id, isOptimistic: true };
      setMessages(prev => [...prev, optimisticMessage]); setInputText(""); setReplyTo(null);
      setTimeout(() => scrollToBottom(), 100);
    } else { setMessages(prev => prev.map(m => m.id === retryId ? { ...m, status: 'sending' } : m)); }
    try {
      if (editingMessage) {
        await supabase.from('messages').update({ text, edited_at: new Date().toISOString() }).eq('id', editingMessage.id);
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text, edited_at: new Date().toISOString() } : m));
        setEditingMessage(null); return;
      }
      const { data, error } = await supabase.from('messages').insert([{ sender_id: currentUser.id, receiver_id: activePartner.id, text, type, file_url: fileUrl || null, status: 'sent', reply_to: retryId ? messages.find(m => m.id === retryId)?.reply_to : replyTo?.id }]).select().single();
      if (error) {
        console.error('Message insert error:', error);
        throw error;
      }
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    } catch (err) {
      console.error('sendMessage exception:', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
    }
  }, [isUnlocked, currentUser, activePartner, replyTo, editingMessage, messages, supabase, scrollToBottom]);

  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !currentUser) return;
    const reactions = { ...(msg.reactions || {}) };
    reactions[currentUser.id] = emoji;
    await supabase.from('messages').update({ reactions }).eq('id', messageId);
  }, [messages, currentUser, supabase]);

  const handleDeleteMe = useCallback(async (messageId: string) => {
    if (!currentUser) return;
    const msg = messages.find(m => m.id === messageId);
    const deleted_by = [...(msg?.deleted_by || [])];
    if (!deleted_by.includes(currentUser.id)) {
      deleted_by.push(currentUser.id);
      await supabase.from('messages').update({ deleted_by }).eq('id', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  }, [currentUser, messages, supabase]);

  const handleDeleteEveryone = useCallback(async (messageId: string) => {
    await supabase.from('messages').update({ is_deleted: true, text: 'This message was deleted' }).eq('id', messageId);
  }, [supabase]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to clipboard");
  }, []);

  const handleStar = useCallback((messageId: string) => {
    setStarredIds(prev => prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]);
    setToast(prev => starredIds.includes(messageId) ? "Unstarred" : "Starred");
  }, [starredIds]);

  const handleExportChat = () => {
    const chatContent = messages.map(m => `[${m.created_at}] ${m.sender_id === currentUser?.id ? 'Me' : activePartner?.name}: ${m.text}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${activePartner?.name}.txt`;
    a.click();
  };

  const handleSeen = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'seen', seen: true } : m));
    await supabase.from('messages').update({ status: 'seen', seen: true }).eq('id', messageId);
  }, [supabase]);

  useEffect(() => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    const channel = supabase.channel('chat-room', { config: { broadcast: { self: false }, presence: { key: currentUser.id } } });
    channelRef.current = channel;
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` }, (payload) => {
      const nm = payload.new as Message; 
      if (nm.sender_id === activePartner.id) { 
        vibrate([5, 50, 5]);
        setMessages(prev => prev.some(m => m.id === nm.id) ? prev : [...prev, nm]); 
        supabase.from('messages').update({ status: 'delivered' }).eq('id', nm.id).then(); 
        if (showScrollBottomRef.current) setUnreadCount(prev => prev + 1);
        else setTimeout(() => scrollToBottomRef.current(), 100);
      }
    }).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${currentUser.id}` }, (payload) => {
      const nm = payload.new as Message;
      if (nm.receiver_id === activePartner.id) {
        setMessages(prev => prev.some(m => m.id === nm.id) ? prev.map(m => m.id === nm.id ? nm : m) : [...prev, nm]);
      }
    }).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
      const nm = payload.new as Message; 
      setMessages(prev => prev.map(m => m.id === nm.id ? nm : m));
    }).on('broadcast', { event: 'typing' }, (p: { payload: { userId: string, isTyping: boolean } }) => { 
      if (p.payload.userId === activePartner.id) { 
        setOtherUserTyping(p.payload.isTyping); 
        if (p.payload.isTyping) setTimeout(() => setOtherUserTyping(false), 3000); 
      } 
    }).subscribe(async (s) => { 
      if (s === 'SUBSCRIBED') await channel.track({ key: currentUser.id, online_at: new Date().toISOString() }); 
    });

    // CALL SIGNALING LISTENER
    const callChannel = supabase.channel('call-signals')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'calls', 
        filter: `receiver_id=eq.${currentUser.id}` 
      }, (payload) => {
        const nc = payload.new as Call;
        if (nc.status === 'ringing') {
          const caller = chatProfiles.find(p => p.id === nc.caller_id);
          if (caller) {
            vibrate([100, 50, 100, 50, 100]);
            setActiveCall({ type: 'incoming', target: caller, call: nc });
          }
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(callChannel);
      channelRef.current = null; 
    };
  }, [currentUser, activePartner, supabase, isUnlocked, chatProfiles]);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;
        if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8);
      };
    });
  };

  const uploadFile = async (file: File, type: string) => {
    if (!currentUser) return { publicUrl: null };
    
    let fileToUpload: File | Blob = file;
    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    }

    const path = `${currentUser.id}/${type}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from('chat-media').upload(path, fileToUpload);
    if (error) return { publicUrl: null };
    const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
    return { publicUrl: data.publicUrl };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    for (const file of files) {
      const { publicUrl } = await uploadFile(file, type);
      if (publicUrl) sendMessage(file.name, type === 'file' ? 'file' : type, publicUrl);
    }
    setShowAttachmentMenu(false);
  };


  const panicTapCount = useRef(0);
  const panicTapTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePanicTap = () => {
    panicTapCount.current += 1;
    if (panicTapTimer.current) clearTimeout(panicTapTimer.current);
    panicTapTimer.current = setTimeout(() => {
      panicTapCount.current = 0;
    }, 500);

    if (panicTapCount.current >= 3) {
      setIsUnlocked(false);
      window.location.href = '/'; 
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: au } } = await supabase.auth.getUser(); 
        if (!au || !sessionManager.isSessionValid()) { 
          window.location.href = "https://sevasansaar.live/";
          return; 
        }
        
        const { data: profiles } = await supabase.from('profiles').select('*');
        if (profiles) {
          const me = profiles.find(p => p.id === au.id); 
          if (me) { 
            setCurrentUser(me); 
            const { error: lsError } = await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', me.id); 
            if (lsError) console.error("LAST SEEN UPDATE ERROR:", lsError);
          }
          const others = profiles.filter(p => p.id !== au.id); 
          setChatProfiles(others); 
          if (others.length > 0 && !activePartner) setActivePartner(others[0]);
        }
        const { data: sDates } = await supabase.from('special_dates').select('*'); if (sDates) setSpecialDates(sDates);
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    }; init();
  }, [supabase, router, activePartner, isUnlocked]);

  // INACTIVITY LOCK
  useEffect(() => {
    if (!isUnlocked) return;
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (currentUser?.id) chatLock.updateLastActive(currentUser.id);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (currentUser?.id && chatLock.isLocked(currentUser.id)) {
          setIsUnlocked(false);
        }
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'touchstart', 'keypress', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timer);
    };
  }, [isUnlocked]);

  // SMART AUTO-LOCK ON RESUME
  useEffect(() => {
    const handleStateChange = () => {
      if (document.visibilityState === 'visible' && currentUser?.id) {
        if (!isOpeningSystemUI.current && chatLock.shouldLock(currentUser.id)) {
          setIsUnlocked(false);
        }
      } else if (document.visibilityState === 'hidden' && currentUser?.id) {
        chatLock.updateLastActive(currentUser.id);
      }
    };
    
    const handleSystemUI = () => { isOpeningSystemUI.current = true; };
    const handleFocus = () => { setTimeout(() => { isOpeningSystemUI.current = false; }, 500); };

    document.addEventListener('visibilitychange', handleStateChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('picking_file', handleSystemUI);
    window.addEventListener('opening_camera', handleSystemUI);

    return () => {
      document.removeEventListener('visibilitychange', handleStateChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('picking_file', handleSystemUI);
      window.removeEventListener('opening_camera', handleSystemUI);
    };
  }, [currentUser?.id]);

  const searchParams = useSearchParams();
  const mustSetupPIN = searchParams.get('setup_pin') === 'true';

  useEffect(() => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePartner.id}),and(sender_id.eq.${activePartner.id},receiver_id.eq.${currentUser.id})`).order('created_at', { ascending: true }).limit(100);
      if (data) {
        setMessages(data.filter(m => !m.deleted_by?.includes(currentUser.id)));
        setTimeout(() => scrollToBottom('instant'), 300);
      }
    }; fetchMsgs();
  }, [currentUser?.id, activePartner?.id, supabase, scrollToBottom, isUnlocked]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string, msgs: { msg: Message, hideTimestamp: boolean, isFirstUnread: boolean }[] }[] = [];
    let foundFirstUnread = false;
    
    messages.forEach((m, i) => {
      const date = formatDateSeparator(m.created_at);
      const prev = messages[i-1];
      const sameSender = prev && prev.sender_id === m.sender_id;
      const within2Mins = prev && (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 2 * 60 * 1000);
      const isGrouped = sameSender && within2Mins;
      
      let isFirstUnread = false;
      if (!foundFirstUnread && m.sender_id !== currentUser?.id && !m.seen) {
        isFirstUnread = true;
        foundFirstUnread = true;
      }

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) lastGroup.msgs.push({ msg: m, hideTimestamp: isGrouped, isFirstUnread });
      else groups.push({ date, msgs: [{ msg: m, hideTimestamp: false, isFirstUnread }] });
    });
    return groups;
  }, [messages, currentUser?.id]);

  const lastMessages = useMemo(() => {
    const map: Record<string, Message> = {};
    messages.forEach(m => {
      const partnerId = m.sender_id === currentUser?.id ? m.receiver_id : m.sender_id;
      if (!map[partnerId] || new Date(m.created_at) > new Date(map[partnerId].created_at)) {
        map[partnerId] = m;
      }
    });
    return map;
  }, [messages, currentUser?.id]);

  if (isLoading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /><p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Synchronizing...</p></div>;
  
  if (!isUnlocked) {
    const userId = currentUser?.id || sessionManager.getUserId() || '';
    const hasPin = chatLock.isLocked(userId);
    
    if (mustSetupPIN || !hasPin) {
      return <PINSetup onComplete={() => setIsUnlocked(true)} userId={userId} />;
    }
    return <PINLock onUnlock={() => setIsUnlocked(true)} userId={userId} />;
  }

  if (!currentUser) return null;

  return (
    <div 
      className="w-full flex items-center justify-center bg-black overflow-hidden font-sans select-none overscroll-none"
      style={{ height: viewportHeight }}
    >
      <AnimatePresence>{toast && <Toast message={toast} onClear={() => setToast(null)} />}</AnimatePresence>
      <AnimatePresence>
        {activeCall && (
          <CallInterface 
            currentUser={currentUser} 
            targetUser={activeCall.target} 
            type={activeCall.type} 
            incomingCall={activeCall.call}
            onClose={() => setActiveCall(null)} 
          />
        )}
      </AnimatePresence>

      <div onClick={handlePanicTap} className="fixed top-0 left-0 w-11 h-11 z-[999] cursor-default" />


        <div className="w-full max-w-[412px] h-full bg-black relative flex flex-col shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'welcome' && (
              <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center bg-black p-10">
                 <div className="mb-auto mt-20 w-80 h-80 relative"><Image src="/welcome-bg.png" alt="Welcome" fill className="object-contain" /></div>
                 <div className="mb-10 text-center">
                    <h2 className="text-xl font-black text-white/90 tracking-[0.3em] uppercase mb-8">SevaSansaar</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">SEVA SANSAAR APP</p>
                    <h1 className="text-[34px] font-bold text-white leading-tight mb-4">Conversations that matter.</h1>
                    <p className="text-white/40 text-sm mb-10 max-w-[280px] mx-auto">Stay close, no matter the distance. SevaSansaar is built for real connections.</p>
                    <button onClick={() => setView('list')} className="w-full h-[58px] rounded-[1.2rem] bg-[#FEF3C7] text-black font-bold text-[15px] flex items-center justify-center gap-2">Get Started <ArrowRight size={18} /></button>
                 </div>
              </motion.div>
            )}

            {view === 'list' && (
              <motion.div key="l" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="p-6 pt-10 safe-top flex flex-col gap-6 shrink-0 bg-black">
                   <div className="flex justify-between items-center"><div className="flex flex-col"><p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">WELCOME BACK</p><h1 className="text-2xl font-bold text-white">{currentUser.name}</h1></div><div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40"><Bell size={20} /></div></div>
                   <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                      <div className="flex flex-col items-center gap-2 shrink-0"><div className="w-[52px] h-[52px] rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30"><Plus size={20} /></div><span className="text-[10px] font-bold text-white/30">Add</span></div>
                      {[currentUser, ...chatProfiles].map(u => (
                        <div key={u.id} className="flex flex-col items-center gap-2 shrink-0" onClick={() => u.id !== currentUser.id && (setActivePartner(u), setView('chat'))}>
                          <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-transparent"><Image src={u.avatar_url || "/default-avatar.png"} fill className="object-cover" alt={u.name} />{onlineUsers.includes(u.id) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />}</div>
                          <span className="text-[10px] font-bold text-white/60">{u.id === currentUser.id ? "You" : u.name.split(' ')[0]}</span>
                        </div>
                      ))}
                   </div>
                </header>
                <div className="flex-1 bg-white rounded-t-[3rem] p-6 overflow-y-auto scrollbar-hide">
                   <h2 className="text-black text-xl font-bold mb-6">Recent Chat</h2>
                   {chatProfiles.map(u => (
                     <div key={u.id} onClick={() => { setActivePartner(u); setView('chat'); }} className="flex items-center gap-4 py-4 border-b border-gray-50 tap-scale">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden"><Image src={u.avatar_url || "/default-avatar.png"} alt={u.name} fill className="object-cover" />{onlineUsers.includes(u.id) && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}</div>
                        <div className="flex-1 min-w-0"><h3 className="font-bold text-black text-base">{u.name}</h3><p className="text-sm truncate text-gray-500">{lastMessages[u.id]?.text || "Start a conversation..."}</p></div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {view === 'calls' && (
              <motion.div key="ca" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="p-6 pt-10 safe-top flex flex-col gap-6 shrink-0 bg-black">
                   <div className="flex justify-between items-center">
                     <div className="flex flex-col">
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">CALL HISTORY</p>
                       <h1 className="text-2xl font-bold text-white">Recent Calls</h1>
                     </div>
                   </div>
                </header>
                <div className="flex-1 bg-white rounded-t-[3rem] p-6 overflow-y-auto scroll-touch hide-scrollbar">
                   {chatProfiles.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                       <Phone size={40} className="mb-4" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No recent calls</p>
                     </div>
                   ) : (
                     chatProfiles.map(u => (
                       <div key={u.id} className="flex items-center gap-4 py-4 border-b border-gray-50 tap-scale transition-all">
                          <div className="w-12 h-12 rounded-full overflow-hidden relative">
                            <Image src={u.avatar_url || "/default-avatar.png"} alt={u.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black text-base">{u.name}</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Voice Call • Yesterday</p>
                          </div>
                          <button 
                            onClick={() => setActiveCall({ type: 'outgoing', target: u })}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 tap-scale transition-colors"
                          >
                            <Phone size={18} />
                          </button>
                       </div>
                     ))
                   )}
                </div>
                <nav className="h-[84px] bg-black flex justify-around items-center px-10 pb-4 safe-bottom">
                  <Phone size={22} className={clsx("transition-colors", (view as string) === 'calls' ? "text-white" : "text-white/30")} onClick={() => setView('calls')} />
                  <MessageCircle size={22} className={clsx("transition-colors", (view as string) === 'list' ? "text-white" : "text-white/30")} onClick={() => setView('list')} />
                  <Settings size={22} className={clsx("transition-colors", (view as string) === 'details' ? "text-white" : "text-white/30")} onClick={() => setView('details')} />
                </nav>
              </motion.div>
            )}

            {view === 'chat' && (
              <motion.div key="c" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
                <header className="p-6 pt-10 safe-top flex items-center justify-between shrink-0 bg-black z-20">
                  <div className="flex items-center gap-4">
                     <div onClick={() => setView('list')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><ChevronLeft size={24} /></div>
                     <div className="flex flex-col items-center gap-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 relative">
                           <Image src={activePartner?.avatar_url || "/default-avatar.png"} alt={activePartner?.name || ""} fill className="object-cover" />
                        </div>
                        <p className={clsx("text-[9px] font-bold uppercase tracking-widest", onlineUsers.includes(activePartner?.id || '') ? "text-green-500" : "text-white/20")}>{onlineUsers.includes(activePartner?.id || '') ? 'Online' : 'Offline'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => activePartner && setActiveCall({ type: 'outgoing', target: activePartner })}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 tap-scale transition-all text-white/40"
                    >
                      <Phone size={20} />
                    </button>
                    <button 
                      onClick={() => setShowMenu(!showMenu)} 
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 tap-scale transition-all text-white/40"
                      aria-label="Menu"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </header>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-6 top-24 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50 min-w-[180px]">
                      <button onClick={() => { setIsSearchOpen(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Search size={16} /> Search in Chat</button>
                      <button onClick={() => { setShowMediaGallery(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><ImageIcon size={16} /> View Media</button>
                      <button onClick={() => { setShowSpecialDates(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Calendar size={16} /> Memories</button>
                      <button onClick={() => { setShowStarred(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Star size={16} /> Starred Messages</button>
                      <button onClick={() => { setIsMuted(!isMuted); localStorage.setItem('sevasansaar_muted', !isMuted ? '1' : ''); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50">{isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />} {isMuted ? 'Unmute' : 'Mute'}</button>
                      <button onClick={() => { handleExportChat(); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Download size={16} /> Export Chat</button>
                      <button onClick={() => { if(currentUser && chatLock.isLocked(currentUser.id)) chatLock.disable(currentUser.id); else setShowSetup(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><Lock size={16} /> {currentUser && chatLock.isLocked(currentUser.id) ? 'Disable Lock' : 'Lock Chat'}</button>
                      <button onClick={() => { setShowWallpaperSheet(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-gray-700 font-bold border-b border-gray-50"><ImageIcon size={16} /> Chat Wallpaper</button>
                      <button onClick={() => { setShowClearConfirm(true); setShowMenu(false); }} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-3 text-xs text-rose-500 font-bold"><Trash2 size={16} /> Clear Chat</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isSearchOpen && (
                  <div className="bg-black p-4 flex items-center gap-3 border-b border-white/5">
                    <div className="flex-1 bg-white/5 rounded-full px-4 py-2 flex items-center gap-2">
                      <Search size={16} className="text-white/30" />
                      <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent text-sm text-white outline-none flex-1" />
                      {searchResults.length > 0 && <span className="text-[10px] font-bold text-white/30 uppercase">{searchIndex + 1} of {searchResults.length}</span>}
                    </div>
                    <div className="flex gap-2"><button onClick={() => setSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length)} className="text-white/30 hover:text-white"><ChevronUp size={20} /></button><button onClick={() => setSearchIndex(prev => (prev + 1) % searchResults.length)} className="text-white/30 hover:text-white"><ChevronDown size={20} /></button><button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="text-white/30 hover:text-white"><X size={20} /></button></div>
                  </div>
                )}

                <div 
                   className="flex-1 rounded-t-[2.5rem] flex flex-col overflow-hidden relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                   style={{ 
                     backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : (wallpaper || 'none'),
                     backgroundColor: !wallpaperUrl && !wallpaper ? '#ffffff' : 'transparent',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     display: 'flex',
                     flexDirection: 'column'
                   }}
                 >
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-4" onScroll={handleScroll}>
                     {isFetchingOlder && <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /></div>}
                     {messages.length === 0 && !isFetchingOlder && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 my-20">
                          <MessageCircle size={60} className="mb-4" />
                          <p className="font-bold uppercase tracking-widest text-[10px]">No messages yet</p>
                        </div>
                      )}
                     {groupedMessages.map(group => (
                       <div key={group.date} className="space-y-4">
                          <div className="flex justify-center"><span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.date}</span></div>
                          {group.msgs.map(({ msg, hideTimestamp, isFirstUnread }) => (
                            <MessageBubble 
                              key={msg.id} message={msg} isMe={msg.sender_id === currentUser.id} 
                              onReact={(e) => handleReact(msg.id, e)} onReply={() => setReplyTo(msg)}
                              onDeleteMe={() => handleDeleteMe(msg.id)} onDeleteEveryone={() => handleDeleteEveryone(msg.id)}
                              onEdit={() => { setEditingMessage(msg); setInputText(msg.text); }}
                              onRetry={() => sendMessage(msg.text, msg.type, msg.file_url || undefined, msg.id)}
                              onCopy={() => handleCopy(msg.text)} onStar={() => handleStar(msg.id)}
                              onForward={() => setToast("Forwarding Coming soon...")}
                              onSeen={() => handleSeen(msg.id)}
                              replyToMsg={msg.reply_to ? messages.find(rm => rm.id === msg.reply_to) : undefined}
                              isHighlighted={searchResults.includes(msg.id)} isStarred={starredIds.includes(msg.id)}
                              hideAvatar={hideTimestamp} hideTimestamp={hideTimestamp} isFirstUnread={isFirstUnread}
                            />
                          ))}
                       </div>
                     ))}
                     {otherUserTyping && <TypingIndicator />}
                     <div ref={scrollRef} className="h-4 w-full shrink-0" />
                  </div>

                  <AnimatePresence>
                    {showScrollBottom && (
                      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => scrollToBottom()} className="absolute bottom-24 right-6 w-12 h-12 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-indigo-600 z-[40]">
                        <ArrowDown size={20} />
                        {unreadCount > 0 && <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white px-1">{unreadCount}</div>}
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <div className="p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30 sticky bottom-0 safe-area-bottom">
                     <AnimatePresence>
                        {showAttachmentMenu && (
                          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-20 left-4 bg-white rounded-3xl shadow-2xl p-2 flex flex-col gap-1 border border-gray-100 z-50">
                             <button onClick={() => { isOpeningSystemUI.current = true; attachmentRef.current?.setAttribute('capture', 'environment'); attachmentRef.current?.click(); }} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 transition-all"><Camera size={18} className="text-indigo-600" /> Camera</button>
                             <button onClick={() => { isOpeningSystemUI.current = true; attachmentRef.current?.removeAttribute('capture'); attachmentRef.current?.click(); }} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 transition-all"><ImageIcon size={18} className="text-indigo-600" /> Gallery</button>
                             <button onClick={() => { isOpeningSystemUI.current = true; attachmentRef.current?.removeAttribute('capture'); attachmentRef.current?.click(); }} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 transition-all"><FileText size={18} className="text-indigo-600" /> Document</button>
                             <input type="file" ref={attachmentRef} className="hidden" multiple onChange={(e) => { isOpeningSystemUI.current = false; handleFileSelect(e, 'file'); }} />
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <AnimatePresence>
                        {showEmojiPanel && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-20 left-4 right-4 bg-white rounded-3xl shadow-2xl p-4 z-50 border border-gray-100 h-60 overflow-y-auto">
                            <div className="grid grid-cols-7 gap-4">
                               {["❤️", "🔥", "😂", "😮", "👍", "😢", "🥰", "✨", "🎉", "🔥", "💯", "🥺", "😍", "🤣", "🤔", "🙌", "🙏", "💖", "💙", "🌸", "⭐", "🌙", "🌈", "🍕", "🍔", "🍦", "🍷", "🎁", "🎈", "🐶", "🐱", "🌹"].map(e => <button key={e} onClick={() => { setInputText(p => p + e); setShowEmojiPanel(false); }} className="text-2xl hover:scale-150 transition-all">{e}</button>)}
                            </div>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <AnimatePresence>{replyTo && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 p-2 bg-indigo-50 rounded-xl flex items-center justify-between border-l-4 border-indigo-500"><div className="min-w-0"><p className="text-[10px] font-bold text-indigo-600 uppercase">Replying to</p><p className="text-xs text-indigo-900 truncate">{replyTo.text}</p></div><button onClick={() => setReplyTo(null)} className="text-indigo-400"><X size={16} /></button></motion.div>}</AnimatePresence>
                     
                     <div className={clsx("flex items-center gap-3 p-2 rounded-2xl border transition-all", isRecording ? "bg-indigo-600 text-white border-transparent" : inputText.trim() ? "border-indigo-200" : "bg-gray-50 border-gray-100 shadow-sm")}>
                        {isRecording ? (
                          <div className="flex-1 flex items-center gap-3 px-2">
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest flex-1">
                              Recording... {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                            </span>
                            <button
                              onClick={stopRecording}
                              disabled={isUploadingAudio}
                              className="text-[10px] font-bold text-white bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                            >
                              {isUploadingAudio ? 'SENDING...' : 'SEND'}
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setShowEmojiPanel(!showEmojiPanel)} className="text-gray-400 hover:text-indigo-600 transition-colors"><Smile size={22} /></button>
                            <button onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className="text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip size={22} /></button>
                            <input value={inputText} onChange={(e) => { setInputText(e.target.value); handleTyping(e.target.value.length > 0); }} onKeyDown={(e) => e.key === 'Enter' && (sendMessage(inputText), handleTyping(false))} placeholder="Message..." className="flex-1 bg-transparent text-sm text-black outline-none font-medium placeholder:text-gray-300 px-2" />
                          </>
                        )}
                        <div className="relative h-10 flex items-center">
                          <AnimatePresence mode="wait">
                            {inputText.trim() ? (
                              <motion.button key="send" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} onClick={() => { sendMessage(inputText); handleTyping(false); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-lg"><Send size={18} /></motion.button>
                            ) : !isRecording && (
                              <motion.button
                                key="mic"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                onMouseDown={() => { isOpeningSystemUI.current = true; startRecording(); }}
                                onMouseUp={() => { isOpeningSystemUI.current = false; stopRecording(); }}
                                onTouchStart={() => { isOpeningSystemUI.current = true; startRecording(); }}
                                onTouchEnd={() => { isOpeningSystemUI.current = false; stopRecording(); }}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              >
                                <Mic size={20} />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                     </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showMediaGallery && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-black z-[100] flex flex-col">
                      <header className="p-6 pt-10 flex items-center justify-between bg-black/80 border-b border-white/5"><div onClick={() => setShowMediaGallery(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><X size={24} /></div><h2 className="text-white font-bold">Media</h2><div className="w-10" /></header>
                      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2">{messages.filter(m => m.type === 'image' && m.file_url).map(m => (<div key={m.id} className="aspect-square bg-white/5 rounded-lg overflow-hidden"><img src={m.file_url!} className="w-full h-full object-cover" /></div>))}</div>
                    </motion.div>
                  )}
                  {showSpecialDates && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-6">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden flex flex-col">
                        <div className="p-8 bg-indigo-600 text-white text-center"> <h2 className="text-2xl font-bold">Memories</h2> </div>
                        <div className="p-6 max-h-[300px] overflow-y-auto space-y-4"> {specialDates.map(d => (<div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"> <div className="flex items-center gap-4"><span className="text-2xl">{d.emoji}</span><div><h4 className="font-bold text-sm">{d.title}</h4><p className="text-[10px] text-gray-400">{d.date}</p></div></div> </div>))} </div>
                        <div className="p-6 bg-gray-50 flex gap-4"><button onClick={() => setShowSpecialDates(false)} className="flex-1 h-12 rounded-2xl bg-white border font-bold text-sm">Close</button></div>
                      </motion.div>
                    </motion.div>
                  )}
                  {showStarred && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-black z-[100] flex flex-col">
                      <header className="p-6 pt-10 flex items-center justify-between bg-black/80 border-b border-white/5"><div onClick={() => setShowStarred(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><X size={24} /></div><h2 className="text-white font-bold">Starred Messages</h2><div className="w-10" /></header>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4"> {messages.filter(m => starredIds.includes(m.id)).map(m => (<div key={m.id} className="p-4 bg-white/5 rounded-2xl border border-white/10"><p className="text-white text-sm">{m.text}</p><div className="mt-2 flex justify-between items-center"><span className="text-[10px] text-white/40">{formatMsgTime(m.created_at)}</span><button onClick={() => handleStar(m.id)}><X size={14} className="text-rose-500" /></button></div></div>))} </div>
                    </motion.div>
                  )}

                  {/* CLEAR CHAT BOTTOM SHEET */}
                  {showClearConfirm && (
                    <div className="absolute inset-0 z-[200] flex items-end">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowClearConfirm(false)} />
                      <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="relative w-full bg-white rounded-t-[3rem] p-10 flex flex-col gap-8 shadow-2xl"
                      >
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500"><Trash2 size={32} /></div>
                          <h3 className="text-2xl font-black text-gray-900">Clear Chat?</h3>
                          <p className="text-gray-500 text-sm">This will clear chat only for you. This cannot be undone.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button onClick={handleClearChat} className="w-full h-16 bg-rose-500 rounded-3xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20">Yes, Clear Chat</button>
                          <button onClick={() => setShowClearConfirm(false)} className="w-full h-16 bg-gray-50 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-xs">Cancel</button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* WALLPAPER BOTTOM SHEET */}
                  {showWallpaperSheet && (
                    <div className="absolute inset-0 z-[200] flex items-end">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowWallpaperSheet(false)} />
                      <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="relative w-full bg-white rounded-t-[3rem] p-10 flex flex-col gap-8 shadow-2xl"
                      >
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Preset Gradients</p>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                              {[
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                'linear-gradient(135deg, #0f172a 0%, #000000 100%)',
                                'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
                                'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                                'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'
                              ].map((g, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => setPresetWallpaper(g)}
                                  className="w-20 h-20 rounded-2xl shrink-0 border-2 border-transparent hover:border-indigo-500 transition-all overflow-hidden"
                                  style={{ background: g }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Custom Wallpaper</p>
                            <label className="w-full h-32 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => isOpeningSystemUI.current = true}>
                              <Camera size={24} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                              <span className="text-xs font-bold text-gray-400">Tap to upload image</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => { isOpeningSystemUI.current = false; handleWallpaperUpload(e); }} />
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button onClick={removeWallpaper} className="w-full h-16 bg-gray-50 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-xs">Remove Wallpaper</button>
                          <button onClick={() => setShowWallpaperSheet(false)} className="w-full h-16 bg-gray-900 rounded-3xl text-white font-black uppercase tracking-widest text-xs">Done</button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {view === 'details' && (
              <motion.div 
                key="d" 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex-1 flex flex-col bg-black overflow-y-auto scrollbar-hide w-full"
                style={{ 
                  height: '100dvh',
                  paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                 <header className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
                    <div onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-90 transition-all"><ChevronLeft size={24} /></div>
                    <h1 className="text-white font-black text-lg uppercase tracking-widest">My Profile</h1>
                    <div className="w-12" />
                 </header>

                 <div className="flex flex-col items-center pt-8 px-6 space-y-10">
                    <ProfileAvatar user={currentUser} onUpdate={(url) => setCurrentUser(prev => prev ? ({ ...prev, avatar_url: url }) : null)} />
                    <ProfileInfo user={currentUser} onUpdate={setCurrentUser} />
                    <RelationshipStats />
                    <AppearanceSettings user={currentUser} onUpdate={(data) => setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null)} />
                    <PrivacySecurity user={currentUser} onUpdate={(data) => setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null)} onTriggerLockSetup={() => setShowSetup(true)} />
                    <ChatStats user={currentUser} />
                    <DangerZone user={currentUser} />
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full bg-rose-500/10 p-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-bold mb-10"
                    >
                      <LogOut size={22} /> Logout Session
                    </button>
                 </div>
              </motion.div>
            )}

            {view === 'calls' && (
              <motion.div 
                key="calls" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col bg-black w-full"
                style={{ height: '100dvh', paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)' }}
              >
                <header className="p-6 pt-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Calls</h1>
                  <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><Phone size={20} /></button>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20"><Phone size={40} /></div>
                  <h3 className="text-white font-bold">No Recent Calls</h3>
                  <p className="text-white/40 text-xs max-w-[200px]">Voice and video calls will appear here once you start a conversation.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONNECTIA BOTTOM NAV (MOBILE) */}
        <AnimatePresence>
          {['list', 'calls', 'details'].includes(view) && (
            <motion.nav 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-[100] safe-area-bottom md:hidden"
            >
              <div className="flex justify-around items-center h-[70px] px-6">
                <button onClick={() => window.location.href = '/'} className="flex flex-col items-center gap-1 text-white/40">
                  <Home size={22} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
                </button>
                <button onClick={() => setView('list')} className={clsx("flex flex-col items-center gap-1", view === 'list' ? "text-indigo-500" : "text-white/40")}>
                  <MessageCircle size={22} fill={view === 'list' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Chats</span>
                </button>
                <button onClick={() => setView('calls')} className={clsx("flex flex-col items-center gap-1", view === 'calls' ? "text-indigo-500" : "text-white/40")}>
                  <Phone size={22} fill={view === 'calls' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Calls</span>
                </button>
                <button onClick={() => setView('details')} className={clsx("flex flex-col items-center gap-1", view === 'details' ? "text-indigo-500" : "text-white/40")}>
                  <User size={22} fill={view === 'details' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

      <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

const TypingIndicator = () => (
  <div className="flex gap-1 items-center px-6 py-2">
    <div className="flex gap-1 bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-none">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    </div>
  </div>
);
