import _sodium from 'libsodium-wrappers';
import { Message } from '@/types';
import { CryptoWorkerManager } from '@/utils/connectia/workerManager';

let sodium: typeof _sodium;

export const initSodium = async () => {
  if (sodium) return sodium;
  await _sodium.ready;
  sodium = _sodium;
  return sodium;
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
    const myPriv = s.from_base64(myPrivateKeyBase64);
    const theirPub = s.from_base64(theirPublicKeyBase64);
    
    return s.crypto_box_beforenm(theirPub, myPriv);
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
    if (!theirPublicKeyBase64) return { text, ciphertext: undefined, nonce: undefined };
    
    // For simplicity, we assume we have the current user's private key in local storage
    const myPrivateKeyBase64 = localStorage.getItem('connectia_private_key');
    if (!myPrivateKeyBase64) return { text, ciphertext: undefined, nonce: undefined };

    const sharedSecret = await ConnectiaCrypto.deriveSharedSecret(myPrivateKeyBase64, theirPublicKeyBase64);
    const { ciphertext, nonce } = await ConnectiaCrypto.encrypt(text, sharedSecret);
    
    return { ciphertext, nonce };
  },

  /**
   * Batch decryption using Web Worker.
   */
  decryptBatch: async (messages: Message[], theirPublicKeyBase64?: string | null) => {
    if (!theirPublicKeyBase64) return messages;
    
    const myPrivateKeyBase64 = localStorage.getItem('connectia_private_key');
    if (!myPrivateKeyBase64) return messages;

    const sharedSecret = await ConnectiaCrypto.deriveSharedSecret(myPrivateKeyBase64, theirPublicKeyBase64);
    return await CryptoWorkerManager.decryptBatch(messages, sharedSecret);
  }
};
