import { useEffect, useCallback } from 'react';
import { db } from '@/lib/connectia/db';
import { Message, Profile } from '@/types';
import { MessageService } from '@/services/connectia/messageService';
import { ConnectiaCrypto } from '@/utils/crypto';
import { useChatStore } from '@/store/useChatStore';
import { messageEngine } from '@/services/connectia/messageEngine';
import { getPrivateKey, getSharedSecret } from '@/utils/crypto';

export const useChatMessages = (
  currentUser: Profile | null,
  activePartner: Profile | null,
  isUnlocked: boolean,
  setToast: (m: string | null) => void,
  scrollToBottom: () => void
) => {
  const { setMessages, isOnline } = useChatStore();

  const fetchMessages = useCallback(async () => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    
    try {
      // 1. LOCAL FIRST (Offline Rule)
      const localMsgs = await db.messages
        .where('[sender_id+receiver_id]')
        .anyOf([[currentUser.id, activePartner.id], [activePartner.id, currentUser.id]])
        .sortBy('created_at');

      if (localMsgs.length > 0) {
        setMessages(localMsgs);
        requestAnimationFrame(scrollToBottom);
      }

      // 2. REMOTE SYNC
      const data = await MessageService.fetchMessages(currentUser.id, activePartner.id);
      
      // 3. DECRYPT & CACHE
      let finalMsgs = data;
      if (activePartner.public_key) {
        try {
          // Decrypt in batches if more than 20 messages for performance
          if (data.length > 20) {
             finalMsgs = await ConnectiaCrypto.decryptBatch(data, activePartner.public_key);
          } else {
             // Inline decryption for small sets
             const myPriv = getPrivateKey();
             if (myPriv) {
               const secret = await getSharedSecret(myPriv, activePartner.public_key, activePartner.id);
               finalMsgs = await Promise.all(data.map(async (m) => {
                 if (m.is_encrypted && m.ciphertext && m.nonce) {
                   const text = await ConnectiaCrypto.decrypt(m.ciphertext, m.nonce, secret);
                   return { ...m, text: text || m.text, isDecrypted: !!text };
                 }
                 return m;
               }));
             }
          }
        } catch (e) {
          console.error("Decryption batch failed", e);
        }
      }

      setMessages(finalMsgs);
      await db.messages.bulkPut(finalMsgs);
      requestAnimationFrame(scrollToBottom);
      
      // Background Cleanup
      db.cleanupOldData();
    } catch (err) {
      console.error("Connectia: Fetch failed", err);
      setToast("Connection issue. Showing offline history.");
    }
  }, [currentUser, activePartner, isUnlocked, setMessages, scrollToBottom, setToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(async (
    text: string, 
    type: Message['type'] = 'text', 
    fileUrl?: string, 
    metadata?: { thumbnailUrl?: string | null, width?: number, height?: number, blurHash?: string, replyTo?: string, id?: string, file?: File }
  ) => {
    if (!currentUser || !activePartner) return;
    
    await messageEngine.sendMessage(text, type, activePartner, currentUser, {
      fileUrl,
      ...metadata
    });
    
    requestAnimationFrame(scrollToBottom);
  }, [currentUser, activePartner, scrollToBottom]);

  // OFFLINE SYNC WORKER
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => messageEngine.processOutbox(), 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  return {
    sendMessage,
    fetchMessages
  };
};

