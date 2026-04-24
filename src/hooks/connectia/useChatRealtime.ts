import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Message, Call, Profile } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useChatStore } from '@/store/useChatStore';
import { CryptoWorkerManager } from '@/utils/connectia/workerManager';

const supabase = createClient();

export const useChatRealtime = (scrollToBottom: () => void, showScrollBottom: boolean) => {
  const {
    currentUser, activePartner, isUnlocked, sharedSecret,
    setMessages, setUnreadCount, setOtherUserTyping, setOnlineUsers,
    setActiveCall, setLastMessage
  } = useChatStore();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isUnlocked || !currentUser) return;

    const channel = supabase.channel('chat-room', { 
      config: { 
        broadcast: { self: false }, 
        presence: { key: currentUser.id } 
      } 
    });
    
    channelRef.current = channel;

    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `receiver_id=eq.${currentUser.id}` 
      }, async (payload) => {
        let nm = payload.new as Message;
        
        // Update unread count and last message globally
        setUnreadCount(nm.sender_id, prev => prev + 1);
        setLastMessage(nm.sender_id, nm);

        if (activePartner && nm.sender_id === activePartner.id) { 
          if (nm.is_encrypted && sharedSecret) {
            nm = await CryptoWorkerManager.decryptSingle(nm, sharedSecret);
          }
          setMessages(prev => prev.some(m => m.id === nm.id) ? prev : [...prev, nm]); 
          supabase.from('messages').update({ status: 'delivered' }).eq('id', nm.id).then(); 
          if (!showScrollBottom) setTimeout(scrollToBottom, 100);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const nm = payload.new as Message; 
        setMessages(prev => prev.map(m => m.id === nm.id ? nm : m));
      })
      .on('broadcast', { event: 'typing' }, (p: { payload: { userId: string, state: 'typing' | 'recording' | null } }) => { 
        if (activePartner && p.payload.userId === activePartner.id) { 
          setOtherUserTyping(p.payload.state || null); 
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (p.payload.state) {
            typingTimeoutRef.current = setTimeout(() => setOtherUserTyping(null), 3000); 
          }
        } 
      })
      .subscribe(async (s) => { 
        if (s === 'SUBSCRIBED') {
          await channel.track({ key: currentUser.id, online_at: new Date().toISOString() }); 
          
          // Rule 8: Presence Heartbeat (Feels live like WhatsApp)
          heartbeatIntervalRef.current = setInterval(() => {
            channel.send({
              type: 'broadcast',
              event: 'ping',
              payload: { userId: currentUser.id }
            });
          }, 5000);
        }
      });

    // Handle Heartbeat Pings
    channel.on('broadcast', { event: 'ping' }, (p) => {
      setOnlineUsers(prev => prev.includes(p.payload.userId) ? prev : [...prev, p.payload.userId]);
    });

    // Rule 2: Message Seen Broadcast (No DB round-trip for critical path)
    channel.on('broadcast', { event: 'message_seen' }, (p) => {
      setMessages(prev => prev.map(m => m.id === p.payload.messageId ? { ...m, status: 'seen' } : m));
    });

    const callChannel = supabase.channel('call-signals')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'calls', 
        filter: `receiver_id=eq.${currentUser.id}` 
      }, (payload) => {
        const nc = payload.new as Call;
        if (nc.status === 'ringing') {
          // Note: In a real app, you'd fetch the caller profile if not in store
          setActiveCall({ type: 'incoming', target: { id: nc.caller_id, name: 'Caller', avatar_url: null } as Profile, call: nc });
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(callChannel);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      channelRef.current = null; 
    };
  }, [currentUser, activePartner, isUnlocked, sharedSecret, setMessages, setUnreadCount, setOtherUserTyping, setOnlineUsers, setActiveCall, setLastMessage, scrollToBottom, showScrollBottom]);

  const handleTyping = (state: 'typing' | 'recording' | null) => {
    if (isUnlocked && channelRef.current && currentUser) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, state }
      });
    }
  };

  const broadcastSeen = (messageId: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message_seen',
        payload: { messageId }
      });
    }
  };

  return { handleTyping, broadcastSeen };
};
