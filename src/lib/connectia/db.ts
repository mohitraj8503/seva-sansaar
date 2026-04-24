import Dexie, { type Table } from 'dexie';
import { Message } from '@/types';

export class ConnectiaDatabase extends Dexie {
  messages!: Table<Message>;

  constructor() {
    super('ConnectiaDB');
    this.version(2).stores({
      messages: 'id, sender_id, receiver_id, created_at, status, [sender_id+receiver_id]'
    });
  }

  async saveMessages(msgs: Message[]) {
    return await this.messages.bulkPut(msgs);
  }

  async getMessages(myId: string, partnerId: string) {
    return await this.messages
      .where('[sender_id+receiver_id]')
      .anyOf([[myId, partnerId], [partnerId, myId]])
      .sortBy('created_at');
  }

  async cleanupOldData() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return await this.messages
      .where('created_at')
      .below(oneDayAgo)
      .delete();
  }
}

export const db = new ConnectiaDatabase();
