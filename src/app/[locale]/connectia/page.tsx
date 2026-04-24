"use client";

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import { useRouter as _useRouter } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/client';

// --- STORE ---
import { useChatStore, ChatView } from '@/store/useChatStore';

// --- TYPES ---
import { Message } from '@/types';

// --- CUSTOM HOOKS ---
import { useChatProfiles } from '@/hooks/connectia/useChatProfiles';
import { useChatMessages } from '@/hooks/connectia/useChatMessages';
import { useChatRealtime } from '@/hooks/connectia/useChatRealtime';
import { useChatMedia } from '@/hooks/connectia/useChatMedia';
import { useChatSettings } from '@/hooks/connectia/useChatSettings';
import { useChatSecurity } from '@/hooks/connectia/useChatSecurity';

// --- COMPONENTS ---
import { RecentChats } from '@/components/connectia/RecentChats';
import { ChatHeader } from '@/components/connectia/ChatHeader';
import { MessageList } from '@/components/connectia/MessageList';
import { ChatFooter } from '@/components/connectia/ChatFooter';
import { CallHistory } from '@/components/connectia/CallHistory';
import { UserProfileView } from '@/components/connectia/UserProfileView';
import { ChatDialogs } from '@/components/connectia/ChatDialogs';
import { MediaGallery } from '@/components/connectia/MediaGallery';
import { Lightbox } from '@/components/connectia/Lightbox';
import { Toast } from '@/components/connectia/Toast';

// --- DYNAMIC COMPONENTS ---
const CallInterface = dynamic(() => import('@/components/CallInterface').then(mod => mod.CallInterface), { ssr: false });
const PINLock = dynamic(() => import('@/components/PINLock').then(mod => mod.PINLock), { ssr: false });

const supabase = createClient();

type FlatMessageItem = 
  | { type: 'date'; date: string }
  | { type: 'message'; msg: Message }
  | { type: 'typing'; state: 'typing' | 'recording' };

export default function ConnectiaPage() {
  const router = _useRouter();
  const [toast, setToast] = React.useState<string | null>(null);

  // --- ZUSTAND STORE ---
  const store = useChatStore();

  // --- BUSINESS LOGIC HOOKS ---
  const {
    chatProfiles, isLoading, recentCalls, specialDates, selectPartner
  } = useChatProfiles();

  const {
    isUnlocked, setIsUnlocked
  } = useChatSecurity(store.currentUser, setToast);

  const {
    sidebarWidth, isMuted, setIsMuted,
    wallpaper, setWallpaper, wallpaperUrl, setWallpaperUrl,
    expiryTime, setExpiryTime
  } = useChatSettings(store.activePartner?.id);

  const {
    sendMessage
  } = useChatMessages(() => {}, setToast);

  const { handleTyping } = useChatRealtime(() => {}, false);

  const isOpeningSystemUI = React.useRef(false);

  const {
    isRecording, recordingSeconds, isUploadingAudio,
    startRecording, stopRecording, handleFileSelect
  } = useChatMedia({
    currentUser: store.currentUser, 
    activePartner: store.activePartner, 
    sendMessage, 
    handleTyping, 
    setToast
  });

  // --- COMPUTED VALUES ---
  const flatMessages = useMemo(() => {
    const result: FlatMessageItem[] = [];
    let lastDate = "";
    store.messages.forEach((m) => {
      const date = new Date(m.created_at).toDateString();
      if (date !== lastDate) {
        result.push({ type: 'date', date: date === new Date().toDateString() ? 'Today' : date });
        lastDate = date;
      }
      result.push({ type: 'message', msg: m });
    });
    if (store.otherUserTyping) result.push({ type: 'typing', state: store.otherUserTyping });
    return result;
  }, [store.messages, store.otherUserTyping]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && store.view === 'welcome') {
      store.setView('list');
    }
  }, [store.view, store.setView, store]);

  const messageMap = useMemo(() => {
    const map: Record<string, Message> = {};
    store.messages.forEach(m => { map[m.id] = m; });
    return map;
  }, [store.messages]);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleExportChat = useCallback(() => {
    if (!store.activePartner) return;
    const chatContent = store.messages.map(m => `[${m.created_at}] ${m.sender_id === store.currentUser?.id ? 'Me' : store.activePartner?.name}: ${m.text}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${store.activePartner.name}.txt`;
    a.click();
  }, [store.messages, store.currentUser, store.activePartner]);

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store.currentUser || !store.activePartner) return;

    const fileName = `${store.currentUser.id}/wallpaper_${store.activePartner.id}_${Date.now()}`;
    const { error } = await supabase.storage.from('chat-media').upload(fileName, file);
    
    if (error) {
      setToast("Failed to upload wallpaper");
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(fileName);
    setWallpaperUrl(publicUrl);
    setWallpaper(null);
    localStorage.setItem(`wallpaper_url_${store.activePartner.id}`, publicUrl);
    store.setShowWallpaperSheet(false);
  };

  // --- SECURITY GATE ---
  if (!isUnlocked && store.currentUser && !isLoading) {
    return <PINLock onUnlock={() => setIsUnlocked(true)} userId={store.currentUser.id} />;
  }

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-black gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Loading Workspace</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#f8f9fa] flex overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence>
        {store.activeCall && store.currentUser && (
          <CallInterface 
            currentUser={store.currentUser}
            targetUser={store.activeCall.target} 
            type={store.activeCall.type} 
            onClose={() => store.setActiveCall(null)} 
            incomingCall={store.activeCall.call} 
          />
        )}
      </AnimatePresence>

      <aside 
        style={{ width: store.isSidebarCollapsed ? 64 : sidebarWidth }}
        className="hidden md:flex flex-col bg-white border-r border-gray-100/50 h-full relative z-20 transition-all duration-500 ease-[0.23, 1, 0.32, 1]"
      >
        {!store.isSidebarCollapsed && (
          <RecentChats 
            chatProfiles={chatProfiles}
            activePartner={store.activePartner}
            setActivePartner={selectPartner}
            view={store.view}
            setView={store.setView}
            setOpenTabs={() => {}} 
            lastMessages={store.lastMessages}
            unreadCounts={store.unreadCounts}
            onlineUsers={store.onlineUsers}
            currentUser={store.currentUser}
            isLoading={isLoading}
          />
        )}
      </aside>

      <main className="flex-1 relative flex flex-col overflow-hidden bg-black w-full">
        <AnimatePresence mode="wait" initial={false}>
          {store.view === 'welcome' && (
             <motion.div key="w" className="flex flex-1 flex-col items-center justify-center bg-[#f8f9fa] text-center p-8">
                <div className="w-32 h-32 bg-white rounded-[3rem] shadow-xl flex items-center justify-center mb-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                    <MessageCircle size={32} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-black mb-4">Start your private space 💬</h2>
                <p className="text-gray-400 max-w-sm font-medium leading-relaxed">Only you two, no one else. Every word, every photo, and every moment is shared in total privacy.</p>
             </motion.div>
          )}

          {store.view === 'list' && (
            <RecentChats 
              chatProfiles={chatProfiles}
              activePartner={store.activePartner}
              setActivePartner={selectPartner}
              view={store.view}
              setView={store.setView}
              setOpenTabs={() => {}}
              lastMessages={store.lastMessages}
              unreadCounts={store.unreadCounts}
              onlineUsers={store.onlineUsers}
              currentUser={store.currentUser}
              isLoading={isLoading}
            />
          )}

          {store.view === 'chat' && store.activePartner && (
            <motion.div key="chat" className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
               <div 
                 className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
                 style={{ background: wallpaperUrl ? `url(${wallpaperUrl}) center/cover no-repeat` : wallpaper || 'white' }} 
               />
               
               <ChatHeader 
                 activePartner={store.activePartner}
                 onlineUsers={store.onlineUsers}
                 setView={store.setView}
                 setActiveCall={store.setActiveCall}
                 showMenu={store.showMenu}
                 setShowMenu={store.setShowMenu}
                 isSearchOpen={store.isSearchOpen}
                 setIsSearchOpen={store.setSearchOpen}
                 searchQuery={store.searchQuery}
                 setSearchQuery={store.setSearchQuery}
                 searchResults={store.searchResults}
                 searchIndex={store.searchIndex}
                 setSearchIndex={store.setSearchIndex}
                 isMuted={isMuted}
                 setIsMuted={setIsMuted}
                 expiryTime={expiryTime}
                 setExpiryTime={setExpiryTime}
                 setToast={setToast}
                 setShowMediaGallery={store.setShowMediaGallery}
                 setShowSpecialDates={store.setShowSpecialDates}
                 setShowStarred={store.setShowStarred}
                 setShowSetup={store.setShowSetup}
                 setShowWallpaperSheet={store.setShowWallpaperSheet}
                 setShowClearConfirm={store.setShowClearConfirm}
                 handleExportChat={handleExportChat}
                 currentUser={store.currentUser}
               />

               <div className="flex-1 relative z-10">
                 <MessageList 
                    flatMessages={flatMessages}
                    currentUser={store.currentUser}
                    messageMap={messageMap}
                    searchResults={store.searchResults}
                    starredIds={store.starredIds}
                 />
               </div>

               <ChatFooter 
                 inputText={store.inputText}
                 setInputText={store.setInputText}
                 sendMessage={sendMessage}
                 handleTyping={handleTyping}
                 startRecording={startRecording}
                 stopRecording={stopRecording}
                 isRecording={isRecording}
                 recordingSeconds={recordingSeconds}
                 showAttachmentMenu={store.showAttachmentMenu}
                 setShowAttachmentMenu={store.setShowAttachmentMenu}
                 showEmojiPanel={store.showEmojiPanel}
                 setShowEmojiPanel={store.setShowEmojiPanel}
                 showGifPicker={store.showGifPicker}
                 setShowGifPicker={store.setShowGifPicker}
                 replyTo={store.replyTo}
                 setReplyTo={store.setReplyTo}
                 editingMessage={store.editingMessage}
                 setEditingMessage={store.setEditingMessage}
                 isUploadingAudio={isUploadingAudio}
                 onFileSelect={handleFileSelect}
                 attachmentRef={{ current: null }}
                 currentUser={store.currentUser}
                 messages={store.messages}
               />
            </motion.div>
          )}

          {store.view === 'calls' && (
            <CallHistory 
              recentCalls={recentCalls}
              setView={store.setView}
              setActivePartner={selectPartner}
              setActiveCall={store.setActiveCall}
              view={store.view}
            />
          )}

          {store.view === 'details' && (
            <UserProfileView 
              currentUser={store.currentUser}
              setCurrentUser={store.setCurrentUser}
              setView={store.setView}
              setShowLogoutConfirm={store.setShowLogoutConfirm}
              setShowSetup={store.setShowSetup}
            />
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden h-20 bg-white/80 backdrop-blur-2xl border-t border-gray-100/50 flex items-center justify-around px-6 safe-bottom shrink-0 relative z-50">
           {[
             { id: 'list', icon: <MessageCircle size={22} />, label: 'Chats' },
             { id: 'calls', icon: <Phone size={22} />, label: 'Calls' },
             { id: 'details', icon: <User size={22} />, label: 'Profile' }
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => store.setView(item.id as ChatView)}
               className={clsx(
                 "flex flex-col items-center gap-1.5 transition-all active:scale-90",
                 store.view === item.id ? "text-indigo-600" : "text-gray-400"
               )}
             >
               {item.icon}
               <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
             </button>
           ))}
        </div>
      </main>

      <ChatDialogs 
        showSpecialDates={store.showSpecialDates}
        setShowSpecialDates={store.setShowSpecialDates}
        specialDates={specialDates}
        showLogoutConfirm={store.showLogoutConfirm}
        setShowLogoutConfirm={store.setShowLogoutConfirm}
        handleLogout={handleLogout}
        showClearConfirm={store.showClearConfirm}
        setShowClearConfirm={store.setShowClearConfirm}
        handleClearChat={() => {}} // Should use handleClearChat from useChatMessages
        showWallpaperSheet={store.showWallpaperSheet}
        setShowWallpaperSheet={store.setShowWallpaperSheet}
        setPresetWallpaper={setWallpaper}
        handleWallpaperUpload={handleWallpaperUpload}
        removeWallpaper={() => { setWallpaper(null); setWallpaperUrl(null); }}
        isOpeningSystemUI={isOpeningSystemUI}
        showSetup={store.showSetup}
        setShowSetup={store.setShowSetup}
        currentUser={store.currentUser}
      />

      <AnimatePresence>
        {store.showMediaGallery && (
          <MediaGallery 
            messages={store.messages}
            activeMediaTab={store.activeMediaTab}
            setActiveMediaTab={store.setActiveMediaTab}
            setShowMediaGallery={store.setShowMediaGallery}
            setLightboxImage={store.setLightboxImage}
          />
        )}
        {store.lightboxImage && <Lightbox src={store.lightboxImage} onClose={() => store.setLightboxImage(null)} />}
        {toast && <Toast message={toast} onClear={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
