import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Message, Call } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useChatStore } from '@/store/useChatStore';
import { CryptoWorkerManager } from '@/utils/connectia/workerManager';
import { messageEngine } from '@/services/connectia/messageEngine';

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
    channel.on('broadcast', { event: 'ping' }, (p: { payload: { userId: string } }) => {
      setOnlineUsers((prev: string[]) => prev.includes(p.payload.userId) ? prev : [...prev, p.payload.userId]);
    });

    // Rule 2: Message Seen Broadcast (No DB round-trip for critical path)
    channel.on('broadcast', { event: 'message_seen' }, (p) => {
      setMessages(prev => prev.map(m => m.id === p.payload.messageId ? { ...m, status: 'seen' } : m));
    });

    // --- RULE: DATABASE-LESS CALL SIGNALING ---
    const userSignals = supabase.channel(`user_signals_${currentUser.id}`);
    
    userSignals
      .on('broadcast', { event: 'call_request' }, async ({ payload }) => {
        // Trigger incoming call UI
        // In a private app, the 'caller' is the only other user
        if (activePartner && payload.callerId === activePartner.id) {
          setActiveCall({ 
            type: 'incoming', 
            target: activePartner, 
            call: { id: payload.callId, caller_id: payload.callerId, receiver_id: currentUser.id, status: 'ringing' } as Call 
          });
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(userSignals);
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
      messageEngine.markAsSeen(messageId, channelRef.current);
    }
  };

  return { handleTyping, broadcastSeen };
};

