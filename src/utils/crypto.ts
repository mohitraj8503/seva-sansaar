import _sodium from 'libsodium-wrappers';

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
    
    // crypto_box_beforenm computes the shared secret (DH)
    return s.crypto_box_beforenm(theirPub, myPriv);
  },

  /**
   * Encrypts a message body using a shared secret.
   */
  encrypt: async (text: string, sharedSecret: Uint8Array) => {
    const s = await initSodium();
    const nonce = s.randombytes_buf(s.crypto_box_NONCEBYTES);
    const ciphertext = s.crypto_box_easy_afternm(text, nonce, sharedSecret);
    
    // Return combined nonce + ciphertext for storage
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
      console.error('Decryption failed. Potential key mismatch or corrupted data.', e);
      return null;
    }
  }
};
