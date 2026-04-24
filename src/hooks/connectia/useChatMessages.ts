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
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  }, [setMessages]);

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

  const sendMessage = useCallback(async (
    text: string, 
    type: Message['type'] = 'text', 
    fileUrl?: string, 
    retryId?: string,
    metadata?: { thumbnailUrl?: string | null, width?: number, height?: number, blurHash?: string }
  ) => {
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
      seen: false,
      thumbnail_url: metadata?.thumbnailUrl,
      width: metadata?.width,
      height: metadata?.height,
      blur_hash: metadata?.blurHash
    };

    // 1. Update UI INSTANTLY (WhatsApp Rule: UI first)
    if (!retryId) {
      setMessages([...messages, newMsg]);
      requestAnimationFrame(() => scrollToBottom());
    } else {
      updateMessageStatus(tempId, 'sending');
    }

    // 2. BACKGROUND PROCESSING (Non-blocking)
    (async () => {
      try {
        // --- SMART ENCRYPTION ---
        let encrypted;
        const { sharedSecretCache } = useChatStore.getState();
        const cachedSecret = sharedSecretCache[activePartner.id];

        if (cachedSecret) {
          // Fast path: use cached secret and inline encryption (no worker overhead for single msg)
          encrypted = await ConnectiaCrypto.encryptInline(text, cachedSecret);
        } else {
          // Slow path: derive and cache
          const { ciphertext, nonce, sharedSecret: newSecret } = await ConnectiaCrypto.encryptMessage(text, activePartner.public_key);
          encrypted = { ciphertext, nonce };
          if (newSecret) useChatStore.getState().setSharedSecretCache(activePartner.id, newSecret);
        }

        // --- MERGED PIPELINE ---
        const supabase = createClient();
        const { ...payload } = newMsg;

        const [, supabaseResult] = await Promise.all([
          db.messages.put({ ...newMsg, status: 'sending' }),
          supabase
            .from('messages')
            .insert([{
              ...payload,
              ciphertext: encrypted.ciphertext,
              nonce: encrypted.nonce,
              text: '[Encrypted Message]',
              is_encrypted: true
            }])
            .select()
            .single()
        ]);

        if (supabaseResult.error) throw supabaseResult.error;

        // --- SUCCESS SYNC ---
        const finalMsg = { ...supabaseResult.data, isDecrypted: true, text: text.trim() };
        await db.messages.put(finalMsg);
        setMessages(prev => prev.map(m => m.id === tempId ? finalMsg : m));

      } catch (err) {
        console.error("Connectia: Async Send failed", err);
        await db.messages.put({ ...newMsg, status: 'failed' });
        updateMessageStatus(tempId, 'failed');
        setToast(isOnline ? "Couldn't send. Tap to retry." : "Saved to offline queue.");
      }
    })();
  }, [isUnlocked, currentUser, activePartner, messages, setMessages, scrollToBottom, updateMessageStatus, setToast, isOnline]);

  // --- OFFLINE RETRY LOGIC ---
  useEffect(() => {
    if (isOnline) {
      const retryFailedMessages = async () => {
        const failedMsgs = await db.messages.where('status').equals('failed').toArray();
        for (const m of failedMsgs) {
          sendMessage(m.text || '', m.type, m.file_url || undefined, m.id, {
            thumbnailUrl: m.thumbnail_url,
            width: m.width,
            height: m.height,
            blurHash: m.blur_hash
          });
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
