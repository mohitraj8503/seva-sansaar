export class CryptoWorkerManager {
  private static worker: Worker | null = null;

  static getWorker() {
    if (!this.worker && typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./crypto.worker.ts', import.meta.url));
    }
    return this.worker;
  }

  static decryptBatch<T>(messages: T[], sharedSecret: Uint8Array): Promise<T[]> {
    const worker = this.getWorker();
    if (!worker) return Promise.resolve(messages);

    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'DECRYPT_BATCH_RESULT') {
          worker.removeEventListener('message', handler);
          resolve(e.data.payload);
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'DECRYPT_BATCH', payload: { messages, sharedSecret } });
    });
  }

  static decryptSingle<T>(message: T, sharedSecret: Uint8Array): Promise<T> {
    const worker = this.getWorker();
    if (!worker) return Promise.resolve(message);

    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'DECRYPT_SINGLE_RESULT') {
          worker.removeEventListener('message', handler);
          resolve(e.data.payload);
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'DECRYPT_SINGLE', payload: { message, sharedSecret } });
    });
  }
}
