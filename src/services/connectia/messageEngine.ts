import { db } from '@/lib/connectia/db';
import { Message, Profile } from '@/types';
import { ConnectiaCrypto, getPrivateKey, getSharedSecret } from '@/utils/crypto';
import { useChatStore } from '@/store/useChatStore';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

export class MessageEngine {
  private static instance: MessageEngine;
  private outboxProcessing = false;

  static getInstance() {
    if (!MessageEngine.instance) {
      MessageEngine.instance = new MessageEngine();
    }
    return MessageEngine.instance;
  }

  /**
   * WHATSAPP RULE: Single deterministic pipeline
   * SELECT -> UI -> LOCAL -> ASYNC(ENCRYPT -> NETWORK -> STATUS)
   */
  async sendMessage(
    text: string,
    type: Message['type'] = 'text',
    partner: Profile,
    currentUser: Profile,
    metadata?: { fileUrl?: string; thumbnailUrl?: string | null; width?: number; height?: number; blurHash?: string; replyTo?: string; file?: File }
  ) {
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. OPTIMISTIC UI: Use local URL for instant preview
    let displayUrl = metadata?.fileUrl || null;
    if (metadata?.file && type === 'image') {
      displayUrl = URL.createObjectURL(metadata.file);
    }

    const localMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: partner.id,
      text: text.trim(),
      type,
      file_url: displayUrl,
      thumbnail_url: metadata?.thumbnailUrl,
      width: metadata?.width,
      height: metadata?.height,
      blur_hash: metadata?.blurHash,
      reply_to: metadata?.replyTo,
      created_at: now,
      status: 'sending',
      seen: false,
    };

    useChatStore.getState().addMessage(localMsg);
    await db.messages.put(localMsg);

    // 2. BACKGROUND PIPELINE
    if (metadata?.file) {
      this.processMediaMessage(localMsg, metadata.file, partner.public_key);
    } else {
      this.processMessage(localMsg, partner.public_key);
    }
    
    return localMsg;
  }

  private async processMediaMessage(msg: Message, file: File, partnerPublicKey: string | null | undefined) {
    try {
      const { MediaUtils } = await import('@/utils/connectia/mediaUtils');
      
      // Background Processing (Compression, BlurHash)
      const [compressed, dimensions, blurHash] = await Promise.all([
        msg.type === 'image' ? MediaUtils.compressImage(file) : Promise.resolve(file),
        msg.type === 'image' ? MediaUtils.getImageDimensions(file) : Promise.resolve({ width: 0, height: 0 }),
        msg.type === 'image' ? MediaUtils.generateBlurHash(file) : Promise.resolve(null)
      ]);

      // Upload
      const path = `${msg.sender_id}/${msg.type}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('chat-media').upload(path, compressed);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // Update message with final metadata and proceed to normal processing
      const updatedMsg = { 
        ...msg, 
        file_url: publicUrl, 
        width: dimensions.width, 
        height: dimensions.height, 
        blur_hash: blurHash || undefined 
      };
      
      await db.messages.put(updatedMsg);
      useChatStore.getState().updateMessage(msg.id, updatedMsg);

      await this.processMessage(updatedMsg, partnerPublicKey);

    } catch (err) {
      console.error('MessageEngine: Media processing failed', err);
      await db.messages.update(msg.id, { status: 'failed' });
      useChatStore.getState().updateMessage(msg.id, { status: 'failed' });
    }
  }

  private async processMessage(msg: Message, partnerPublicKey: string | null | undefined) {
    try {
      let payload = { ...msg };

      // Encryption Layer
      if (partnerPublicKey) {
        const myPriv = getPrivateKey();
        if (myPriv) {
          const secret = await getSharedSecret(myPriv, partnerPublicKey, msg.receiver_id);
          const encrypted = await ConnectiaCrypto.encrypt(msg.text, secret);
          payload = {
            ...payload,
            ciphertext: encrypted.ciphertext,
            nonce: encrypted.nonce,
            text: '[Encrypted Message]',
            is_encrypted: true
          };
        }
      }

      // Network Layer (Supabase)
      const { data, error } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Update local state and DB to 'sent'
      const finalMsg = { ...msg, ...data, text: msg.text, status: 'sent' as const };
      await db.messages.put(finalMsg);
      useChatStore.getState().updateMessage(msg.id, { status: 'sent', id: data.id });

    } catch (err) {
      console.error('MessageEngine: Processing failed', err);
      await db.messages.update(msg.id, { status: 'failed' });
      useChatStore.getState().updateMessage(msg.id, { status: 'failed' });
    }
  }

  /**
   * OFFLINE-FIRST: Auto-retry failed messages when online
   */
  async processOutbox() {
    if (this.outboxProcessing) return;
    this.outboxProcessing = true;

    try {
      const failedMsgs = await db.messages.where('status').equals('failed').toArray();
      const { currentUser, activePartner } = useChatStore.getState();

      if (!currentUser || !failedMsgs.length) return;

      for (const msg of failedMsgs) {
        // We only retry if the message belongs to the current chat for simplicity in this flow
        // but a real outbox would fetch partner profiles too
        if (activePartner && msg.receiver_id === activePartner.id) {
           await this.processMessage(msg, activePartner.public_key);
        }
      }
    } finally {
      this.outboxProcessing = false;
    }
  }

  /**
   * REAL-TIME TICK: Broadcast 'seen' status without DB bottleneck
   */
  async markAsSeen(messageId: string, channel: RealtimeChannel | null) {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'message_seen',
        payload: { messageId }
      });
    }
    // Background update Supabase
    supabase.from('messages').update({ seen: true, status: 'seen' }).eq('id', messageId).then();
    await db.messages.update(messageId, { status: 'seen', seen: true });
  }
}

export const messageEngine = MessageEngine.getInstance();
