import _sodium from 'libsodium-wrappers';
import { Message } from '@/types';
import { CryptoWorkerManager } from '@/utils/connectia/workerManager';

import { useChatStore } from '@/store/useChatStore';

let sodium: typeof _sodium;

// --- KEY CACHE (Rule 5: Load once, stay in memory) ---
export const getPrivateKey = () => {
  const cached = useChatStore.getState().privateKeyCache;
  if (cached) return cached;
  
  const stored = localStorage.getItem('connectia_private_key');
  if (stored) useChatStore.getState().setPrivateKeyCache(stored);
  return stored;
};

const sharedSecretCache = new Map<string, Uint8Array>();

export const initSodium = async () => {
  if (sodium) return sodium;
  await _sodium.ready;
  sodium = _sodium;
  return sodium;
};

export const getSharedSecret = async (myPrivBase64: string, theirPubBase64: string, partnerId: string) => {
  if (sharedSecretCache.has(partnerId)) return sharedSecretCache.get(partnerId)!;
  
  const secret = await ConnectiaCrypto.deriveSharedSecret(myPrivBase64, theirPubBase64);
  sharedSecretCache.set(partnerId, secret);
  return secret;
};

/**
 * Encapsulates the E2EE logic for Connectia.
 */
export const ConnectiaCrypto = {
  /**
   * Generates a new X25519 keypair for the user.
   */
  generateKeyPair: async () => {
    const s = await initSodium();
    const keypair = s.crypto_box_keypair();
    return {
      publicKey: s.to_base64(keypair.publicKey),
      privateKey: s.to_base64(keypair.privateKey)
    };
  },

  /**
   * Precomputes a shared secret between two users.
   */
  deriveSharedSecret: async (myPrivateKeyBase64: string, theirPublicKeyBase64: string) => {
    const s = await initSodium();
    try {
      const myPriv = s.from_base64(myPrivateKeyBase64);
      const theirPub = s.from_base64(theirPublicKeyBase64);
      
      if (theirPub.length !== s.crypto_box_PUBLICKEYBYTES) {
        throw new Error(`Invalid public key length: expected ${s.crypto_box_PUBLICKEYBYTES}, got ${theirPub.length}`);
      }
      if (myPriv.length !== s.crypto_box_SECRETKEYBYTES) {
        throw new Error(`Invalid private key length: expected ${s.crypto_box_SECRETKEYBYTES}, got ${myPriv.length}`);
      }
      
      return s.crypto_box_beforenm(theirPub, myPriv);
    } catch (e) {
      console.error('Connectia: Shared secret derivation failed', e);
      throw e;
    }
  },

  /**
   * Encrypts a message body using a shared secret.
   */
  encrypt: async (text: string, sharedSecret: Uint8Array) => {
    const s = await initSodium();
    const nonce = s.randombytes_buf(s.crypto_box_NONCEBYTES);
    const ciphertext = s.crypto_box_easy_afternm(text, nonce, sharedSecret);
    
    return {
      nonce: s.to_base64(nonce),
      ciphertext: s.to_base64(ciphertext)
    };
  },

  /**
   * Decrypts a message body using a shared secret.
   */
  decrypt: async (ciphertextBase64: string, nonceBase64: string, sharedSecret: Uint8Array) => {
    const s = await initSodium();
    const ciphertext = s.from_base64(ciphertextBase64);
    const nonce = s.from_base64(nonceBase64);
    
    try {
      const decrypted = s.crypto_box_open_easy_afternm(ciphertext, nonce, sharedSecret);
      return s.to_string(decrypted);
    } catch (e) {
      console.error('Decryption failed.', e);
      return null;
    }
  },

  /**
   * High-level encryption for a message.
   */
  encryptMessage: async (text: string, theirPublicKeyBase64?: string | null) => {
    if (!theirPublicKeyBase64) return { ciphertext: undefined, nonce: undefined };
    
    const myPrivateKeyBase64 = getPrivateKey();
    if (!myPrivateKeyBase64) return { ciphertext: undefined, nonce: undefined };

    const sharedSecret = await ConnectiaCrypto.deriveSharedSecret(myPrivateKeyBase64, theirPublicKeyBase64);
    const { ciphertext, nonce } = await ConnectiaCrypto.encrypt(text, sharedSecret);
    
    return { ciphertext, nonce, sharedSecret };
  },

  /**
   * Fast, inline encryption without worker overhead (Rule 4)
   */
  encryptInline: async (text: string, sharedSecret: Uint8Array) => {
    return await ConnectiaCrypto.encrypt(text, sharedSecret);
  },

  /**
   * Batch decryption using Web Worker.
   */
  decryptBatch: async (messages: Message[], theirPublicKeyBase64?: string | null) => {
    if (!theirPublicKeyBase64) return messages;
    
    const myPrivateKeyBase64 = getPrivateKey();
    if (!myPrivateKeyBase64) return messages;

    const sharedSecret = await ConnectiaCrypto.deriveSharedSecret(myPrivateKeyBase64, theirPublicKeyBase64);
    return await CryptoWorkerManager.decryptBatch(messages, sharedSecret);
  }
};
