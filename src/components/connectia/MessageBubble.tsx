import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, Reply, Trash2, Copy, Star, Smile, 
  FileText, Download, Phone, Video, RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { Message } from '@/types';
import { formatMsgTime, extractUrl } from '@/utils/connectia/helpers';
import { MessageStatusTicks } from './MessageStatusTicks';
import { LazyVideo } from './LazyVideo';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { LinkPreview } from './LinkPreview';
import { ImageBubble } from './ImageBubble';
import { useLongPress } from '@/hooks/connectia/useLongPress';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReact: (id: string, emoji: string) => void;
  onReply: (m: Message) => void;
  onDeleteMe: (id: string) => void;
  onDeleteEveryone: (id: string) => void;
  onEdit: (m: Message) => void;
  onCopy: (t: string) => void;
  onStar: (id: string) => void;
  onLightbox: (data: { url: string; messageId: string }) => void;
  onSeen: (id: string) => void;
  replyToMessage?: Message;
  isStarred: boolean;
  isSearchResult: boolean;
  onRetry: (m: Message) => void;
}

export const MessageBubble = memo(({
  message, isMe, onReact, onReply, onDeleteMe, onDeleteEveryone,
  onEdit, onCopy, onStar, onLightbox, onSeen, replyToMessage,
  isStarred, isSearchResult, onRetry
}: MessageBubbleProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const url = extractUrl(message.text);

  const longPress = useLongPress(
    () => setShowOptions(true),
    () => { if (!isMe && message.status !== 'seen') onSeen(message.id); }
  );

  const reactionsCount = message.reactions ? Object.keys(message.reactions).length : 0;

  return (
    <div 
      className={clsx(
        "flex flex-col mb-4 px-4 md:px-8 max-w-full transition-colors group/bubble",
        isMe ? "items-end" : "items-start",
        isSearchResult && "bg-white/5 rounded-2xl py-2"
      )}
      {...longPress}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowOptions(true);
      }}
    >
      <div className={clsx("flex items-end gap-2 max-w-[75%] group", isMe ? "flex-row-reverse" : "flex-row")}>
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "relative rounded-2xl shadow-sm transition-all overflow-hidden",
              isMe 
                ? "bg-[var(--bubble-sent)] text-white rounded-tr-sm" 
                : "bg-[var(--bubble-received)] text-white rounded-tl-sm",
              message.type === 'image' ? "p-1" : "px-4 py-2",
              message.status === 'failed' && "border border-rose-500/50"
            )}
          >
            {/* REPLY PREVIEW */}
            {replyToMessage && (
              <div className={clsx("mb-2 p-2 rounded-xl text-[12px] border-l-4", isMe ? "bg-white/10 border-white/30 text-white/90" : "bg-white/5 border-indigo-400 text-white/80")}>
                <p className="font-bold mb-0.5 text-[10px] uppercase tracking-wider">Reply to {replyToMessage.sender_id === message.sender_id ? 'self' : 'Partner'}</p>
                <p className="line-clamp-1">{replyToMessage.text}</p>
              </div>
            )}

            {/* MESSAGE CONTENT */}
            {message.is_deleted ? (
               <p className="italic text-[14px] opacity-40">This message was deleted</p>
            ) : (
              <>
                {message.type === 'text' && (
                  <div className="space-y-2">
                    <p className="text-[15px] leading-snug break-words whitespace-pre-wrap">{message.text}</p>
                    {url && <LinkPreview url={url} />}
                  </div>
                )}

                {message.type === 'image' && (
                  <ImageBubble message={message} onLightbox={(url) => onLightbox({ url, messageId: message.id })} />
                )}

                {message.type === 'video' && <LazyVideo src={message.file_url!} />}

                {message.type === 'audio' && <CustomAudioPlayer src={message.file_url!} />}

                {message.type === 'file' && (
                  <div className={clsx("flex items-center gap-3 p-2 rounded-xl", isMe ? "bg-white/10" : "bg-white/5")}>
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white"><FileText size={20} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{message.text}</p>
                      <p className="text-[10px] opacity-60">Document</p>
                    </div>
                    <a href={message.file_url!} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/60"><Download size={18} /></a>
                  </div>
                )}

                {message.type === 'call' && (
                   <div className="flex items-center gap-3">
                      <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", isMe ? "bg-white/20" : "bg-indigo-500/20 text-indigo-400")}>
                         {message.text.includes('Video') ? <Video size={20} /> : <Phone size={20} />}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold">{message.text}</span>
                         <span className="text-[10px] opacity-60">Call Log</span>
                      </div>
                   </div>
                )}
              </>
            )}

            {/* STATUS & TIME */}
            <div className={clsx("flex items-center gap-1 mt-1 justify-end opacity-60")}>
              <span className="text-[10px] font-medium">{formatMsgTime(message.created_at)}</span>
              {message.edited_at && <span className="text-[9px] font-bold uppercase">Edited</span>}
              {isMe && <MessageStatusTicks status={message.status} />}
              {isStarred && <Star size={10} fill="currentColor" />}
            </div>
            
            {/* RETRY BUTTON FOR FAILED MESSAGES */}
            {message.status === 'failed' && isMe && (
              <button 
                onClick={() => onRetry(message)}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg w-full justify-center"
              >
                <RefreshCw size={10} />
                Retry
              </button>
            )}
          </motion.div>

          {/* REACTIONS DISPLAY */}
          {reactionsCount > 0 && (
            <div className={clsx("absolute -bottom-2 flex gap-1 bg-white border border-gray-100 rounded-full px-2 py-0.5 shadow-sm z-10", isMe ? "right-2" : "left-2")}>
              {Object.entries(message.reactions || {}).map(([uid, emoji]) => (
                <span key={uid} className="text-xs">{emoji}</span>
              ))}
            </div>
          )}
        </div>

        {/* HOVER ACTIONS (Desktop) */}
        <div className="hidden group-hover:flex flex-col gap-1 self-center">
          <button onClick={() => setShowReactions(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><Smile size={18} /></button>
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* OPTIONS MODAL / SHEET */}
      <AnimatePresence>
        {showOptions && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowOptions(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-4 w-full max-w-xs shadow-2xl relative z-10 flex flex-col gap-1">
              <button onClick={() => { onReply(message); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors font-bold text-sm text-gray-700"> <Reply size={20} /> Reply </button>
              <button onClick={() => { onCopy(message.text); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors font-bold text-sm text-gray-700"> <Copy size={20} /> Copy </button>
              <button onClick={() => { onStar(message.id); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors font-bold text-sm text-gray-700"> <Star size={20} /> {isStarred ? 'Unstar' : 'Star'} </button>
              {isMe && <button onClick={() => { onEdit(message); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors font-bold text-sm text-gray-700"> <MoreVertical size={20} /> Edit </button>}
              <div className="h-[1px] bg-gray-50 my-2 mx-4" />
              <button onClick={() => { onDeleteMe(message.id); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-rose-50 text-rose-500 rounded-2xl transition-colors font-bold text-sm"> <Trash2 size={20} /> Delete for me </button>
              {isMe && <button onClick={() => { onDeleteEveryone(message.id); setShowOptions(false); }} className="flex items-center gap-4 p-4 hover:bg-rose-50 text-rose-500 rounded-2xl transition-colors font-bold text-sm"> <Trash2 size={20} /> Delete for everyone </button>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReactions && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20" onClick={() => setShowReactions(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-full p-2 flex gap-2 shadow-2xl relative z-10">
              {['❤️', '😂', '😮', '😢', '😡', '👍'].map(emoji => (
                <button key={emoji} onClick={() => { onReact(message.id, emoji); setShowReactions(false); }} className="w-12 h-12 flex items-center justify-center text-2xl hover:scale-125 transition-transform"> {emoji} </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
