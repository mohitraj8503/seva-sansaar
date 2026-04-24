import _sodium from 'libsodium-wrappers';

let sodium: typeof _sodium;

const initSodium = async () => {
  if (sodium) return sodium;
  await _sodium.ready;
  sodium = _sodium;
  return sodium;
};

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  const s = await initSodium();

  if (type === 'DECRYPT_BATCH') {
    const { messages, sharedSecret } = payload;
    const decryptedMessages = await Promise.all(messages.map(async (m: { ciphertext: string, nonce: string, [key: string]: unknown }) => {
      try {
        const ciphertext = s.from_base64(m.ciphertext);
        const nonce = s.from_base64(m.nonce);
        const decrypted = s.crypto_box_open_easy_afternm(ciphertext, nonce, sharedSecret);
        return { ...m, text: s.to_string(decrypted), isDecrypted: true };
      } catch {
        return { ...m, text: "[Decryption Failed]", isDecrypted: false };
      }
    }));
    self.postMessage({ type: 'DECRYPT_BATCH_RESULT', payload: decryptedMessages });
  }

  if (type === 'DECRYPT_SINGLE') {
    const { message, sharedSecret } = payload;
    try {
      const ciphertext = s.from_base64(message.ciphertext);
      const nonce = s.from_base64(message.nonce);
      const decrypted = s.crypto_box_open_easy_afternm(ciphertext, nonce, sharedSecret);
      self.postMessage({ 
        type: 'DECRYPT_SINGLE_RESULT', 
        payload: { ...message, text: s.to_string(decrypted), isDecrypted: true } 
      });
    } catch {
      self.postMessage({ 
        type: 'DECRYPT_SINGLE_RESULT', 
        payload: { ...message, text: "[Decryption Failed]", isDecrypted: false } 
      });
    }
  }
};
