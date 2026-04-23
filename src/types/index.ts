export interface Profile {
  id: string;
  name: string;
  avatar_url?: string | null;
  email: string;
  last_seen?: string;
  created_at?: string;
  bio?: string;
  theme?: string;
  accent_color?: string;
  show_last_seen?: boolean;
  show_online_status?: boolean;
}

export interface Message {
  id: string;
  text: string;
  file_url: string | null;
  type: 'text' | 'image' | 'audio' | 'file' | 'video';
  sender_id: string; 
  receiver_id: string;
  status: 'sent' | 'delivered' | 'seen' | 'sending' | 'failed';
  seen: boolean;
  reactions?: Record<string, string>;
  created_at: string;
  reply_to?: string;
  is_deleted?: boolean;
  isOptimistic?: boolean;
  edited_at?: string;
  deleted_by?: string[];
}
