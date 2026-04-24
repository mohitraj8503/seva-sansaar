import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, LogOut } from 'lucide-react';
import { Profile } from '@/types';
import dynamic from 'next/dynamic';
import { useChatStore } from '@/store/useChatStore';
import { clsx } from 'clsx';

const ProfileAvatar = dynamic(() => import('@/components/profile/ProfileAvatar').then(mod => mod.ProfileAvatar), { ssr: false });
const ProfileInfo = dynamic(() => import('@/components/profile/ProfileInfo').then(mod => mod.ProfileInfo), { ssr: false });
const AppearanceSettings = dynamic(() => import('@/components/profile/AppearanceSettings').then(mod => mod.AppearanceSettings), { ssr: false });
const PrivacySecurity = dynamic(() => import('@/components/profile/PrivacySecurity').then(mod => mod.PrivacySecurity), { ssr: false });
const RelationshipStats = dynamic(() => import('@/components/profile/RelationshipStats').then(mod => mod.RelationshipStats), { ssr: false });
const ChatStats = dynamic(() => import('@/components/profile/ChatStats').then(mod => mod.ChatStats), { ssr: false });
const DangerZone = dynamic(() => import('@/components/profile/DangerZone').then(mod => mod.DangerZone), { ssr: false });

interface UserProfileViewProps {
  currentUser: Profile | null;
  setCurrentUser: (val: Profile | null | ((prev: Profile | null) => Profile | null)) => void;
  setView: (v: 'list' | 'calls' | 'details') => void;
  setShowLogoutConfirm: (s: boolean) => void;
  setShowSetup: (s: boolean) => void;
}

export const UserProfileView = ({
  currentUser, setCurrentUser, setView, setShowLogoutConfirm, setShowSetup
}: UserProfileViewProps) => {
  return (
    <motion.div 
      key="d" 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="flex-1 flex flex-col bg-black overflow-y-auto scrollbar-hide w-full"
      style={{ 
        paddingBottom: '120px',
        WebkitOverflowScrolling: 'touch'
      }}
    >
       <header className="p-6 pt-safe pb-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
          <div onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </div>
          <h1 className="text-white font-black text-lg uppercase tracking-widest">My Profile</h1>
          <div className="w-12" />
       </header>

       <div className="flex flex-col items-center pt-8 px-6 space-y-10">
          {currentUser && (
            <>
              <ProfileAvatar 
                user={currentUser} 
                onUpdate={(url) => setCurrentUser(prev => prev ? ({ ...prev, avatar_url: url }) : null)} 
              />
              <ProfileInfo 
                user={currentUser} 
                onUpdate={setCurrentUser} 
              />
              <RelationshipStats />
              <AppearanceSettings 
                user={currentUser} 
                onUpdate={(data) => setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null)} 
              />
              <PrivacySecurity 
                user={currentUser as Profile} 
                _onUpdate={(data: Partial<Profile>) => setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null)} 
                onTriggerLockSetup={() => setShowSetup(true)} 
              />
              <ChatStats user={currentUser} />
              
              <div className="w-full bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white font-bold">Dark Mode</span>
                  <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Premium Theme</span>
                </div>
                <button 
                  onClick={() => useChatStore.getState().setDarkMode(!useChatStore.getState().darkMode)}
                  className={clsx(
                    "w-14 h-8 rounded-full p-1 transition-all duration-500",
                    useChatStore.getState().darkMode ? "bg-indigo-600" : "bg-gray-700"
                  )}
                >
                  <div className={clsx(
                    "w-6 h-6 bg-white rounded-full transition-all duration-500 transform",
                    useChatStore.getState().darkMode ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              <DangerZone user={currentUser} />
            </>
          )}
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-rose-500/10 p-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-bold mb-10"
          >
            <LogOut size={22} /> Logout Session
          </button>
       </div>
    </motion.div>
  );
};
