import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Message, Profile } from '@/types';
import { MessageService } from '@/services/connectia/messageService';
import { ConnectiaCrypto } from '@/utils/crypto';
import { db } from '@/lib/connectia/db';
import { useChatStore } from '@/store/useChatStore';

export const useChatMessages = (
  currentUser: Profile | null,
  activePartner: Profile | null,
  isUnlocked: boolean,
  setToast: (m: string | null) => void,
  scrollToBottom: () => void
) => {
  const { messages, setMessages, isOnline } = useChatStore();
  const [hasMore, setHasMore] = useState(true);

  const updateMessageStatus = useCallback((id: string, status: Message['status']) => {
    setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
  }, [messages, setMessages]);

  const decryptMessages = useCallback(async (msgs: Message[]) => {
    if (!activePartner?.public_key) return msgs;
    try {
      return await ConnectiaCrypto.decryptBatch(msgs, activePartner.public_key);
    } catch {
      return msgs;
    }
  }, [activePartner]);

  const fetchMessages = useCallback(async () => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    
    try {
      // 1. Check Local DB First
      const localMsgs = await db.messages
        .where('sender_id').anyOf([currentUser.id, activePartner.id])
        .and(m => m.receiver_id === currentUser.id || m.receiver_id === activePartner.id)
        .sortBy('created_at');

      if (localMsgs.length > 0) {
        setMessages(localMsgs);
        setTimeout(scrollToBottom, 100);
      }

      // 2. Fetch from Supabase
      const data = await MessageService.fetchMessages(currentUser.id, activePartner.id);
      
      // 3. Decrypt and Merge
      const decrypted = await decryptMessages(data);
      setMessages(decrypted);
      
      // Save to local DB for offline access
      await db.messages.bulkPut(decrypted);
      
      setTimeout(scrollToBottom, 300);
      
      // 4. Background Cleanup
      db.cleanupOldData();
    } catch {
      setToast("Failed to load messages");
    }
  }, [currentUser, activePartner, isUnlocked, decryptMessages, setMessages, scrollToBottom, setToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (text: string, type: Message['type'] = 'text', fileUrl?: string, retryId?: string) => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    if (!text.trim() && !fileUrl) return;

    const now = new Date().toISOString();
    const tempId = retryId || crypto.randomUUID();
    
    const newMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: activePartner.id,
      text: text.trim(),
      type,
      file_url: fileUrl || null,
      created_at: now,
      status: 'sending',
      seen: false
    };

    // Update UI instantly
    if (!retryId) {
      setMessages([...messages, newMsg]);
      setTimeout(scrollToBottom, 100);
    } else {
      updateMessageStatus(tempId, 'sending');
    }

    try {
      // 1. Encrypt if needed
      const encrypted = await ConnectiaCrypto.encryptMessage(text, activePartner.public_key);
      
      // 2. Send to Supabase
      const { data, error } = await createClient()
        .from('messages')
        .insert([{
          ...newMsg,
          id: undefined, // Let Supabase generate ID
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce,
          text: '[Encrypted Message]'
        }])
        .select()
        .single();

      if (error) throw error;

      // 3. Success -> Update local DB and state
      await db.messages.put({ ...data, isDecrypted: true, text: text.trim() });
      setMessages(messages.map(m => m.id === tempId ? { ...data, isDecrypted: true, text: text.trim() } : m));
      
    } catch {
      // 4. Failure -> Offline Queue
      await db.messages.put({ ...newMsg, status: 'failed' });
      updateMessageStatus(tempId, 'failed');
      setToast("Message failed. Saved to offline queue.");
    }
  }, [isUnlocked, currentUser, activePartner, messages, setMessages, scrollToBottom, updateMessageStatus, setToast]);

  // --- OFFLINE RETRY LOGIC ---
  useEffect(() => {
    if (isOnline) {
      const retryFailedMessages = async () => {
        const failedMsgs = await db.messages.where('status').equals('failed').toArray();
        for (const m of failedMsgs) {
          sendMessage(m.text || '', m.type, m.file_url || undefined, m.id);
        }
      };
      retryFailedMessages();
    }
  }, [isOnline, sendMessage]);

  const fetchOlderMessages = useCallback(async () => {
    if (!isUnlocked || !currentUser || !activePartner || !hasMore) return;
    const oldestMsg = messages[0];
    if (!oldestMsg) return;
    
    try {
      const data = await MessageService.fetchOlderMessages(currentUser.id, activePartner.id, oldestMsg.created_at);
      if (data.length > 0) {
        const decrypted = await decryptMessages(data);
        setMessages([...decrypted.reverse(), ...messages]);
      } else {
        setHasMore(false);
      }
    } catch {
      setToast("Failed to load older messages");
    }
  }, [isUnlocked, currentUser, activePartner, hasMore, messages, decryptMessages, setMessages, setToast]);

  return {
    fetchOlderMessages,
    sendMessage
  };
};
