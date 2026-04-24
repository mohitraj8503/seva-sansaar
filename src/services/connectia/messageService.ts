import { createClient } from '@/utils/supabase/client';
import { Message } from '@/types';

const supabase = createClient();

export class MessageService {
  static async fetchMessages(currentUserId: string, partnerId: string, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as Message[];
    } catch (err) {
      console.error('Fetch messages error:', err);
      throw err;
    }
  }

  static async fetchOlderMessages(currentUserId: string, partnerId: string, beforeDate: string, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .lt('created_at', beforeDate)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Message[];
    } catch (err) {
      console.error('Fetch older messages error:', err);
      throw err;
    }
  }

  static async sendMessage(payload: Partial<Message>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  }

  static async updateMessage(id: string, updates: Partial<Message>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    } catch (err) {
      console.error('Update message error:', err);
      throw err;
    }
  }

  static async deleteChat(currentUserId: string, partnerId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`);

      if (error) throw error;
    } catch (err) {
      console.error('Delete chat error:', err);
      throw err;
    }
  }

  static async deleteForMe(id: string, userId: string) {
    try {
      const { data: msg } = await supabase.from('messages').select('deleted_by').eq('id', id).single();
      const deletedBy = msg?.deleted_by || [];
      if (!deletedBy.includes(userId)) {
        await supabase.from('messages').update({ deleted_by: [...deletedBy, userId] }).eq('id', id);
      }
    } catch (err) {
      console.error('Delete for me error:', err);
      throw err;
    }
  }

  static async deleteForEveryone(id: string) {
    try {
      await supabase.from('messages').update({ text: 'This message was deleted', is_deleted: true, file_url: null }).eq('id', id);
    } catch (err) {
      console.error('Delete for everyone error:', err);
      throw err;
    }
  }

  static async fetchLastMessages(currentUserId: string, partnerIds: string[]) {
    try {
      const results = await Promise.all(partnerIds.map(async (pid) => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${pid}),and(sender_id.eq.${pid},receiver_id.eq.${currentUserId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return { partnerId: pid, message: data as Message };
      }));
      return results;
    } catch (err) {
      console.error('Fetch last messages error:', err);
      return [];
    }
  }

  static async fetchUnreadCounts(currentUserId: string, partnerIds: string[]) {
    try {
      const results = await Promise.all(partnerIds.map(async (pid) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', pid)
          .eq('receiver_id', currentUserId)
          .eq('seen', false);
        return { partnerId: pid, count: count || 0 };
      }));
      return results;
    } catch (err) {
      console.error('Fetch unread counts error:', err);
      return [];
    }
  }
}
