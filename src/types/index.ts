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
  public_key?: string | null;
}

export interface Message {
  id: string;
  text: string;
  file_url: string | null;
  type: 'text' | 'image' | 'audio' | 'file' | 'video' | 'call';
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
  is_encrypted?: boolean;
  ciphertext?: string;
  nonce?: string;
  expires_at?: string | null;
  // Media Metadata
  thumbnail_url?: string | null;
  width?: number;
  height?: number;
  blur_hash?: string;
  voice_url?: string | null;
}

export interface Call {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: 'calling' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
  type: 'audio' | 'video';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer?: any;
  created_at: string;
  ended_at?: string;
  duration_sec?: number;
}

export interface CallLog extends Call {
  peer: Profile;
  direction: 'incoming' | 'outgoing';
}

export interface SpecialDate {
  id: string;
  title: string;
  date: string;
  emoji: string;
}
