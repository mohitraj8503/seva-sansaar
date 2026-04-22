"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Phone, MoreVertical, CheckCheck, ChevronLeft, ArrowRight, 
  MessageCircle, Send, Plus, Settings, LogOut, Palette, Bell, Mic, Edit2, BellRing
} from 'lucide-react';
import { clsx } from 'clsx';
import { createClient } from '@/utils/supabase/client';
import confetti from 'canvas-confetti';

// --- TYPES & INTERFACES ---
interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  email: string;
}

interface Message {
  id: string;
  text: string;
  file_url: string | null;
  type: 'text' | 'image' | 'audio' | 'file';
  sender_id: string; 
  receiver_id: string;
  status: 'sent' | 'delivered' | 'seen';
  seen: boolean;
  reactions?: Record<string, string>;
  created_at: string;
}

const REACTION_EMOJIS = ["❤️", "🔥", "😂", "😮", "👍", "😢"];

// --- UTILS ---
const formatMsgTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const utcStr = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`;
    const date = new Date(utcStr);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  } catch (e) { return "00:00"; }
};

// --- COMPONENTS ---

const TypingIndicator = () => (
  <div className="flex gap-1 items-center px-6 py-2">
    <div className="flex gap-1 bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-none">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    </div>
  </div>
);

const MessageStatusTicks = ({ status }: { status: 'sent' | 'delivered' | 'seen' }) => {
  if (status === 'sent') return <CheckCheck size={14} className="text-gray-300" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-gray-500" />;
  if (status === 'seen') return <CheckCheck size={14} className="text-blue-400" />;
  return null;
};

const ReactionTray = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }} animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }} className="absolute -top-14 left-1/2 z-50 flex gap-2.5 bg-black/90 backdrop-blur-xl p-2.5 rounded-full shadow-2xl border border-white/10">
    {REACTION_EMOJIS.map(emoji => (
      <button key={emoji} onClick={(e) => { e.stopPropagation(); onSelect(emoji); }} className="text-2xl hover:scale-150 active:scale-90 transition-all">{emoji}</button>
    ))}
  </motion.div>
);

const MessageBubble = memo(({ message, isMe, onReact }: { message: Message, isMe: boolean, onReact: (emoji: string) => void }) => {
  const [showTray, setShowTray] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const reactions = useMemo(() => Object.entries(message.reactions || {}), [message.reactions]);

  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className={clsx("flex flex-col max-w-[85%] relative mb-2", isMe ? "ml-auto items-end" : "items-start")}>
      <AnimatePresence>{showTray && <ReactionTray onSelect={(e) => { onReact(e); setShowTray(false); }} />}</AnimatePresence>
      <div 
        onClick={() => {
          const now = Date.now();
          if (now - lastTapRef.current < 300) { onReact("❤️"); setShowHeart(true); confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } }); setTimeout(() => setShowHeart(false), 800); }
          lastTapRef.current = now;
        }}
        onMouseEnter={() => setShowTray(true)} onMouseLeave={() => setShowTray(false)}
        className={clsx("p-3.5 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm transition-all relative cursor-pointer", isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-[#FFF9E0] text-black rounded-tl-none border border-black/5")}
      >
        <AnimatePresence>{showHeart && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 1.8, 1.4], opacity: [1, 1, 0] }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"><span className="text-5xl">❤️</span></motion.div>}</AnimatePresence>
        {message.type === 'audio' ? <div className="flex items-center gap-2">🎙️ Voice Message</div> : <p>{message.text}</p>}
        {reactions.length > 0 && (
          <div className="absolute -bottom-2.5 right-1 flex items-center bg-white border border-gray-100 px-1.5 py-0.5 rounded-full shadow-sm scale-90">
             {Array.from(new Set(reactions.map(r => r[1]))).map((e, idx) => <span key={idx} className="text-[11px]">{e}</span>)}
             {reactions.length > 1 && <span className="text-[9px] font-bold text-gray-500 ml-0.5">{reactions.length}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-60">
        <span className="text-[10px] font-bold text-gray-400">{formatMsgTime(message.created_at)}</span>
        {isMe && <MessageStatusTicks status={message.status} />}
      </div>
    </motion.div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// --- MAIN APP ---

export default function LoveLinkApp() {
  const supabase = createClient();
  const [view, setView] = useState<'welcome' | 'list' | 'chat' | 'details'>('welcome');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markAsDelivered = useCallback(async (meId: string) => {
    await supabase.from('messages').update({ status: 'delivered' }).eq('receiver_id', meId).eq('status', 'sent');
  }, [supabase]);

  const markAsSeen = useCallback(async () => {
    if (!currentUser || !otherUser || view !== 'chat') return;
    const unreadIds = messages.filter(m => m.receiver_id === currentUser.id && m.sender_id === otherUser.id && (m.status !== 'seen' || !m.seen)).map(m => m.id);
    if (unreadIds.length === 0) return;
    setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, seen: true, status: 'seen' } : m));
    await supabase.from('messages').update({ seen: true, status: 'seen' }).in('id', unreadIds);
  }, [currentUser, otherUser, view, messages, supabase]);

  const handleReact = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    const updated = { ...(msg.reactions || {}) };
    if (updated[currentUser.id] === emoji) delete updated[currentUser.id]; else updated[currentUser.id] = emoji;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: updated } : m));
    await supabase.from('messages').update({ reactions: updated }).eq( 'id', messageId);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image too large (max 2MB)"); return; }
    setIsUploading(true);
    try {
      const filePath = `${currentUser.id}/avatar-${Date.now()}`;
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', currentUser.id);
      setCurrentUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (err: unknown) { 
      const message = err instanceof Error ? err.message : "Upload failed";
      alert(message); 
    } finally { setIsUploading(false); }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentUser) return;
    supabase.channel('chat-v16').send({ type: 'broadcast', event: 'typing', payload: { userId: currentUser.id, isTyping } });
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!au) { window.location.replace("/en/login"); return; }
      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        const me = profiles.find(p => p.id === au.id);
        const other = profiles.find(p => p.id !== au.id);
        if (me) { setCurrentUser(me); markAsDelivered(me.id); }
        if (other) setOtherUser(other);
        if (me && other) {
          const { data: msgs } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${me.id},receiver_id.eq.${other.id}),and(sender_id.eq.${other.id},receiver_id.eq.${me.id})`).order('created_at', { ascending: true });
          if (msgs) setMessages(msgs);
        }
      }
    };
    init();
  }, [supabase, markAsDelivered]);

  useEffect(() => {
    if (!currentUser || !otherUser) return;
    const ch = supabase.channel('chat-v16', { config: { presence: { key: currentUser.id } } });
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const nm = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === nm.id) ? prev : [...prev, nm]);
        if (nm.receiver_id === currentUser.id) supabase.from('messages').update({ status: 'delivered' }).eq('id', nm.id).eq('status', 'sent');
      } else if (payload.eventType === 'UPDATE') { setMessages(prev => prev.map(m => m.id === (payload.new as Message).id ? (payload.new as Message) : m)); }
    }).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
      const np = payload.new as Profile;
      if (np.id === currentUser.id) setCurrentUser(np);
      if (np.id === otherUser.id) setOtherUser(np);
    }).on('broadcast', { event: 'typing' }, (p: { payload: { userId: string, isTyping: boolean } }) => { if (p.payload.userId !== currentUser.id) setOtherUserTyping(p.payload.isTyping); })
      .on('presence', { event: 'sync' }, () => setOnlineUsers(Object.keys(ch.presenceState())))
      .subscribe(async (s) => { if (s === 'SUBSCRIBED') await ch.track({ online_at: new Date().toISOString() }); });
    return () => { supabase.removeChannel(ch); };
  }, [currentUser, otherUser, supabase]);

  useEffect(() => { if (view === 'chat') { markAsSeen(); scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); } }, [view, markAsSeen]);

  if (!currentUser) return null;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black overflow-hidden font-sans">
      <div className="w-full max-w-[412px] h-full bg-black relative flex flex-col shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'welcome' && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center bg-black p-10 relative overflow-hidden">
               <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 opacity-60"><img src="/welcome-bg.png" alt="3D Welcome" className="w-full h-full object-contain" /></div>
               <div className="mt-auto mb-10 flex flex-col items-center text-center max-w-[320px] relative z-10">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">GOOD NIGHT, {currentUser.name} 👋</p>
                  <h1 className="text-[34px] font-bold text-white leading-tight mb-4">Conversations that matter.</h1>
                  <p className="text-white/40 text-[13px] leading-relaxed mb-10">Stay close, no matter the distance. LoveLink is built for real connections.</p>
                  <button onClick={() => setView('list')} className="w-full h-[58px] rounded-[1.2rem] bg-[#FEF3C7] text-black font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all">Get Started <ArrowRight size={18} /></button>
               </div>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div key="l" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full">
              <header className="p-6 pt-10 flex flex-col gap-6 shrink-0">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col"><p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">GOOD NIGHT, {currentUser.name} 👋</p><h1 className="text-2xl font-bold text-white">LoveLink</h1></div>
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40"><Bell size={20} /></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h2 className="text-white text-sm font-bold">Story</h2><button className="text-white/30 text-[10px] font-bold uppercase tracking-wider">See All</button></div>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-col items-center gap-2 shrink-0"><div className="w-[52px] h-[52px] rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30"><Plus size={20} /></div><span className="text-[10px] font-bold text-white/30">Add</span></div>
                    {[currentUser, otherUser].filter(Boolean).map((u) => (
                      <div key={u?.id} className="flex flex-col items-center gap-2 shrink-0">
                        <div className="relative shrink-0"><img src={u?.avatar_url || "/default-avatar.png"} alt={u?.name} className={clsx("w-[52px] h-[52px] rounded-full object-cover p-0.5", u?.id === currentUser.id ? "border border-white/10" : "border-2 border-[#FEF3C7]")} />{onlineUsers.includes(u?.id || '') && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />}</div>
                        <span className="text-[10px] font-bold text-white/60">{u?.id === currentUser.id ? "You" : u?.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </header>
              <div className="flex-1 bg-white rounded-t-[3rem] mt-4 flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6 shrink-0"><h2 className="text-black text-xl font-bold">Recent Chat</h2><Search size={20} className="text-gray-300" /></div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                   {otherUser && (
                     <div onClick={() => setView('chat')} className="flex items-center gap-4 py-4 border-b border-gray-50 cursor-pointer group">
                       <div className="relative shrink-0"><img src={otherUser.avatar_url || "/default-avatar.png"} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover shadow-sm" />{onlineUsers.includes(otherUser.id) && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}</div>
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-black text-base">{otherUser.name}</h3><span className="text-[10px] font-bold text-gray-400">{messages.length > 0 ? formatMsgTime(messages[messages.length-1].created_at) : "00:00"}</span></div>
                         <div className="flex justify-between items-center"><p className="text-sm truncate text-gray-500 flex-1">{messages.length > 0 ? (messages[messages.length-1].type === 'audio' ? '🎙️ Voice Message' : messages[messages.length-1].text) : "Start a conversation..."}</p>{messages.filter(m => m.receiver_id === currentUser.id && m.status !== 'seen').length > 0 && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{messages.filter(m => m.receiver_id === currentUser.id && m.status !== 'seen').length}</div>}</div>
                       </div>
                     </div>
                   )}
                </div>
              </div>
              <nav className="h-[84px] bg-black flex justify-around items-center px-10 pb-4 shrink-0"><div className="flex flex-col items-center gap-1 text-white/30"><Phone size={22} /><span className="text-[9px] font-bold uppercase tracking-wider">Calls</span></div><div className="flex flex-col items-center gap-1 text-white"><MessageCircle size={22} /><span className="text-[9px] font-bold uppercase tracking-wider">Messages</span></div><div onClick={() => setView('details')} className="flex flex-col items-center gap-1 text-white/30"><Settings size={22} /><span className="text-[9px] font-bold uppercase tracking-wider">Settings</span></div></nav>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div key="c" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full bg-black relative">
              <header className="p-6 pt-10 flex items-center justify-between shrink-0 bg-black z-20">
                <div className="flex items-center gap-4">
                   <div onClick={() => setView('list')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors active:scale-90"><ChevronLeft size={24} /></div>
                   <div className="relative shrink-0"><img src={otherUser?.avatar_url || "/default-avatar.png"} alt={otherUser?.name} className="w-10 h-10 rounded-full object-cover" />{onlineUsers.includes(otherUser?.id || '') && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />}</div>
                   <div className="min-w-0">
                      <h2 className="text-white font-bold text-sm leading-tight">{otherUser?.name}</h2>
                      <p className={clsx("text-[9px] font-bold uppercase tracking-widest", onlineUsers.includes(otherUser?.id || '') ? "text-green-500" : "text-white/20")}>{onlineUsers.includes(otherUser?.id || '') ? 'Online' : 'Offline'}</p>
                   </div>
                </div>
                <MoreVertical size={20} className="text-white/40" />
              </header>
              <div className="flex-1 bg-white rounded-t-[2.5rem] flex flex-col overflow-hidden relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                   {messages.map(m => <MessageBubble key={m.id} message={m} isMe={m.sender_id === currentUser.id} onReact={(e) => handleReact(m.id, e)} />)}
                   {otherUserTyping && <TypingIndicator />}
                   <div ref={scrollRef} />
                </div>
                <footer className="p-4 pt-2 bg-white pb-6 border-t border-gray-50">
                   <div className={clsx("flex items-center gap-3 p-2 rounded-2xl border transition-all", inputText.trim() ? "border-indigo-200" : "bg-gray-50 border-gray-100 shadow-sm")}>
                      <button className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"><Mic size={20} /></button>
                      <input 
                         value={inputText} 
                         onChange={(e) => { 
                            setInputText(e.target.value); 
                            handleTyping(e.target.value.length > 0);
                         }} 
                         onBlur={() => handleTyping(false)}
                         onKeyDown={(e) => e.key === 'Enter' && (async () => { 
                            if (!inputText.trim()) return; 
                            const t = inputText.trim(); 
                            setInputText(""); 
                            handleTyping(false);
                            await supabase.from('messages').insert([{ text: t, sender_id: currentUser.id, receiver_id: otherUser!.id, type: 'text', status: 'sent' }]); 
                         })()} 
                         placeholder="Message..." 
                         className="flex-1 bg-transparent text-sm text-black outline-none font-medium placeholder:text-gray-300 px-2" 
                      />
                      <Send 
                         size={18} 
                         className={clsx("mr-2 cursor-pointer transition-colors", inputText.trim() ? "text-indigo-600" : "text-gray-300")} 
                         onClick={async () => { 
                            if (!inputText.trim()) return; 
                            const t = inputText.trim(); 
                            setInputText(""); 
                            handleTyping(false);
                            await supabase.from('messages').insert([{ text: t, sender_id: currentUser.id, receiver_id: otherUser!.id, type: 'text', status: 'sent' }]); 
                         }} 
                      />
                   </div>
                </footer>
              </div>
            </motion.div>
          )}

          {view === 'details' && (
            <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col bg-black h-full">
               <header className="p-6 pt-10 flex items-center justify-between shrink-0">
                  <div onClick={() => setView('list')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-90"><ChevronLeft size={24} /></div>
                  <h1 className="text-white font-bold text-base">Profile Settings</h1>
                  <div className="w-10" />
               </header>
               <div className="flex-1 flex flex-col items-center pt-8 px-6 overflow-y-auto scrollbar-hide">
                  <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <img src={currentUser.avatar_url || "/default-avatar.png"} alt={currentUser.name} className={clsx("w-32 h-32 rounded-full border-4 border-white/10 shadow-2xl object-cover transition-opacity", isUploading && "opacity-50")} />
                     {isUploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}
                     <div className="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full border-4 border-black shadow-lg"><Edit2 size={14} className="text-white" /></div>
                     <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <h2 className="text-white text-2xl font-bold mb-1 flex items-center gap-2">{currentUser.name} <Plus size={18} className="text-white/40" /></h2>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-10">TAP PHOTO TO CHANGE</p>
                  <div className="w-full space-y-3 pb-10">
                     <div className="bg-[#1A1A1A] p-5 rounded-[1.5rem] flex items-center justify-between text-white/80 active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-4"><Palette size={20} className="text-white/40" /><span className="font-bold text-sm tracking-tight">Theme Appearance</span></div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">DARK MODE</span>
                     </div>
                     <div className="bg-[#1A1A1A] p-5 rounded-[1.5rem] flex items-center justify-between text-white/80 active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-4"><BellRing size={20} className="text-white/40" /><span className="font-bold text-sm tracking-tight">Notifications</span></div>
                        <div className="w-10 h-5 bg-indigo-600 rounded-full relative p-0.5 flex justify-end"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                     </div>
                     <div onClick={() => { supabase.auth.signOut(); localStorage.removeItem("lovelink_session_v2"); window.location.replace("/en/login"); }} className="bg-rose-500/10 p-5 rounded-[1.5rem] flex items-center gap-4 text-rose-500 border border-rose-500/20 active:scale-[0.98] transition-transform cursor-pointer">
                        <LogOut size={20} /><span className="font-bold text-sm tracking-tight">Logout Session</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
