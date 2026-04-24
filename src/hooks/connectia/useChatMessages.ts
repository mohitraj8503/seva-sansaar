import { useCallback, useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { MessageService } from '@/services/connectia/messageService';
import { ConnectiaCrypto } from '@/utils/crypto';
import { Message } from '@/types';

export const useChatMessages = (scrollToBottom: () => void, setToast: (m: string | null) => void) => {
  const {
    currentUser, activePartner, isUnlocked, sharedSecret, expiryTime,
    messages, setMessages, hasMore, replyTo, setReplyTo,
    editingMessage, setEditingMessage
  } = useChatStore();

  const decryptMessages = useCallback(async (msgs: Message[]) => {
    if (!sharedSecret) return msgs;
    return await Promise.all(msgs.map(async (m) => {
      if (m.is_encrypted && m.ciphertext && m.nonce) {
        const text = await ConnectiaCrypto.decrypt(m.ciphertext, m.nonce, sharedSecret);
        return { ...m, text: text || '[Decryption Failed]' };
      }
      return m;
    }));
  }, [sharedSecret]);

  const fetchMessages = useCallback(async () => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    try {
      const data = await MessageService.fetchMessages(currentUser.id, activePartner.id);
      const decrypted = await decryptMessages(data);
      setMessages(decrypted.filter(m => !m.deleted_by?.includes(currentUser.id)));
      setTimeout(scrollToBottom, 300);
    } catch {
      setToast("Failed to load messages");
    }
  }, [currentUser, activePartner, isUnlocked, decryptMessages, setMessages, scrollToBottom, setToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const fetchOlderMessages = useCallback(async () => {
    if (!isUnlocked || !currentUser || !activePartner || !hasMore) return;
    const oldestMsg = messages[0];
    if (!oldestMsg) return;
    
    try {
      const data = await MessageService.fetchOlderMessages(currentUser.id, activePartner.id, oldestMsg.created_at);
      if (data.length > 0) {
        const decrypted = await decryptMessages(data);
        setMessages(prev => [...decrypted.reverse(), ...prev]);
      }
    } catch {
      setToast("Failed to load older messages");
    }
  }, [isUnlocked, currentUser, activePartner, hasMore, messages, decryptMessages, setMessages, setToast]);

  const sendMessage = useCallback(async (text: string, type: Message['type'] = 'text', fileUrl?: string, retryId?: string) => {
    if (!isUnlocked || !currentUser || !activePartner) return;
    if (!text.trim() && !fileUrl) return;

    const tempId = retryId || crypto.randomUUID();
    const expiresAt = expiryTime ? new Date(Date.now() + expiryTime * 1000).toISOString() : null;

    if (!retryId) {
      const optimisticMessage: Message = { 
        id: tempId, text, sender_id: currentUser.id, receiver_id: activePartner.id, 
        type, file_url: fileUrl || null, status: 'sending', seen: false, 
        created_at: new Date().toISOString(), reply_to: replyTo?.id, 
        isOptimistic: true, expires_at: expiresAt 
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setReplyTo(null);
      setTimeout(scrollToBottom, 100);
    } else {
      setMessages(prev => prev.map(m => m.id === retryId ? { ...m, status: 'sending' } : m));
    }

    try {
      if (editingMessage) {
        await MessageService.updateMessage(editingMessage.id, { text, edited_at: new Date().toISOString() });
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text, edited_at: new Date().toISOString() } : m));
        setEditingMessage(null);
        return;
      }

      const payload: Partial<Message> = { 
        sender_id: currentUser.id, 
        receiver_id: activePartner.id, 
        text, type, 
        file_url: fileUrl || null, 
        status: 'sent', 
        reply_to: retryId ? messages.find(m => m.id === retryId)?.reply_to : replyTo?.id,
        expires_at: expiresAt
      };

      if (sharedSecret) {
        const { nonce, ciphertext } = await ConnectiaCrypto.encrypt(text, sharedSecret);
        payload.ciphertext = ciphertext;
        payload.nonce = nonce;
        payload.is_encrypted = true;
        payload.text = '[Encrypted Message]';
      }

      const data = await MessageService.sendMessage(payload);
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    } catch (err) {
      console.error('sendMessage exception:', err);
      if (!navigator.onLine) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      }
    }
  }, [isUnlocked, currentUser, activePartner, replyTo, editingMessage, messages, sharedSecret, expiryTime, setMessages, setReplyTo, setEditingMessage, scrollToBottom]);

  return {
    fetchOlderMessages, sendMessage
  };
};
