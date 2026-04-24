import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile, Call, SpecialDate } from '@/types';
import { ConnectiaCrypto } from '@/utils/crypto';
import { useChatStore } from '@/store/useChatStore';
import { MessageService } from '@/services/connectia/messageService';

const supabase = createClient();

export const useChatProfiles = () => {
  const {
    currentUser, setCurrentUser, setActivePartner, setSharedSecret,
    setUnreadCount, setLastMessage
  } = useChatStore();

  const [chatProfiles, setChatProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);

  const fetchInitialData = useCallback(async (user: Profile) => {
    try {
      // 1. Fetch Chat Partners
      const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id);
      if (profiles) {
        setChatProfiles(profiles);
        const pids = profiles.map(p => p.id);
        
        // 2. Fetch Last Messages and Unread Counts
        const lastMsgs = await MessageService.fetchLastMessages(user.id, pids);
        const unreadCounts = await MessageService.fetchUnreadCounts(user.id, pids);
        
        lastMsgs.forEach(item => { if (item.message) setLastMessage(item.partnerId, item.message); });
        unreadCounts.forEach(item => setUnreadCount(item.partnerId, item.count));
      }

      // 3. Fetch Calls
      const { data: calls } = await supabase.from('calls').select('*').or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(20);
      if (calls) setRecentCalls(calls);

      // 4. Fetch Special Dates
      const { data: dates } = await supabase.from('special_dates').select('*').or(`user_id.eq.${user.id},partner_id.eq.${user.id}`);
      if (dates) setSpecialDates(dates);

    } catch (err) {
      console.error('Fetch initial data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setLastMessage, setUnreadCount]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setCurrentUser(profile);
            await fetchInitialData(profile);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Session init error:', err);
        setIsLoading(false);
      }
    };
    initSession();

    // REALTIME PROFILE UPDATES
    const channel = supabase.channel('profile_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updatedProfile = payload.new as Profile;
        
        // Update chatProfiles list
        setChatProfiles(prev => prev.map(p => p.id === updatedProfile.id ? { ...p, ...updatedProfile } : p));
        
        // Update currentUser if it's me
        if (useChatStore.getState().currentUser?.id === updatedProfile.id) {
          setCurrentUser(prev => prev ? ({ ...prev, ...updatedProfile }) : updatedProfile);
        }
        
        // Update activePartner if it's them
        if (useChatStore.getState().activePartner?.id === updatedProfile.id) {
          setActivePartner(updatedProfile);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [setCurrentUser, fetchInitialData, setActivePartner]);

  const selectPartner = useCallback(async (partner: Profile) => {
    if (!currentUser) return;
    setActivePartner(partner);
    
    // Derive Shared Secret
    const secret = await ConnectiaCrypto.deriveSharedSecret(currentUser.id, partner.id);
    setSharedSecret(secret);
    
    // Mark as read
    setUnreadCount(partner.id, 0);
    await supabase.from('messages').update({ seen: true, status: 'seen' }).eq('sender_id', partner.id).eq('receiver_id', currentUser.id).eq('seen', false);
  }, [currentUser, setActivePartner, setSharedSecret, setUnreadCount]);

  return {
    chatProfiles, isLoading, recentCalls, specialDates, selectPartner
  };
};
