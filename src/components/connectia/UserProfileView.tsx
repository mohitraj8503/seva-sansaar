import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, LogOut } from 'lucide-react';
import { Profile } from '@/types';
import dynamic from 'next/dynamic';

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
        height: '100dvh',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 90px)',
        WebkitOverflowScrolling: 'touch'
      }}
    >
       <header className="p-6 safe-top flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
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
