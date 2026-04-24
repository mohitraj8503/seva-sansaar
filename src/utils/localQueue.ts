import Dexie, { Table } from 'dexie';

export interface PendingMessage {
  id?: string; // temp UUID
  text: string;
  type: string;
  file_url?: string;
  sender_id: string;
  receiver_id: string;
  reply_to?: string;
  expires_at?: string;
  created_at: string;
}

class ConnectiaDB extends Dexie {
  pendingMessages!: Table<PendingMessage>;

  constructor() {
    super('ConnectiaOffline');
    this.version(1).stores({
      pendingMessages: 'id, created_at'
    });
  }
}

export const db = new ConnectiaDB();

export const OfflineQueue = {
  add: async (msg: PendingMessage) => {
    await db.pendingMessages.add(msg);
  },
  remove: async (id: string) => {
    await db.pendingMessages.delete(id);
  },
  getAll: async () => {
    return await db.pendingMessages.toArray();
  }
};
