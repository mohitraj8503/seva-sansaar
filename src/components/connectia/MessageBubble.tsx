import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, Reply, Trash2, Copy, Star, Smile, 
  FileText, Download, Phone, Video
} from 'lucide-react';
import Image from "next/image";
import { clsx } from 'clsx';
import { Message } from '@/types';
import { formatMsgTime, extractUrl } from '@/utils/connectia/helpers';
import { MessageStatusTicks } from './MessageStatusTicks';
import { LazyVideo } from './LazyVideo';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { LinkPreview } from './LinkPreview';
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
  onLightbox: (url: string) => void;
  onSeen: (id: string) => void;
  replyToMessage?: Message;
  isStarred: boolean;
  isSearchResult: boolean;
}

export const MessageBubble = memo(({
  message, isMe, onReact, onReply, onDeleteMe, onDeleteEveryone,
  onEdit, onCopy, onStar, onLightbox, onSeen, replyToMessage,
  isStarred, isSearchResult
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
        "flex flex-col mb-4 px-4 md:px-8 max-w-full hover:bg-black/5 transition-colors group/bubble",
        isMe ? "items-end" : "items-start",
        isSearchResult && "bg-indigo-50/50 rounded-2xl py-2"
      )}
      {...longPress}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowOptions(true);
      }}
    >
      <div className={clsx("flex items-end gap-2 max-w-[85%] md:max-w-[70%] group", isMe ? "flex-row-reverse" : "flex-row")}>
        <div className="relative">
          <motion.div 
            layoutId={message.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={clsx(
              "relative px-5 py-3 rounded-[2rem] shadow-sm transition-all",
              isMe ? "bg-indigo-600 text-white rounded-tr-lg" : "bg-white text-black border border-gray-100 rounded-tl-lg",
              message.status === 'failed' && "border-rose-500 opacity-80"
            )}
          >
            {/* REPLY PREVIEW */}
            {replyToMessage && (
              <div className={clsx("mb-2 p-3 rounded-2xl text-[11px] border-l-4", isMe ? "bg-white/10 border-white/30 text-white/80" : "bg-gray-50 border-indigo-500 text-gray-500")}>
                <p className="font-black mb-1">Reply to {replyToMessage.sender_id === message.sender_id ? 'self' : 'Partner'}</p>
                <p className="line-clamp-1">{replyToMessage.text}</p>
              </div>
            )}

            {/* MESSAGE CONTENT */}
            {message.is_deleted ? (
               <p className="italic text-[13px] opacity-60">This message was deleted</p>
            ) : (
              <>
                {message.type === 'text' && (
                  <div className="space-y-2">
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
                    {url && <LinkPreview url={url} />}
                  </div>
                )}

                {message.type === 'image' && (
                  <div className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform" onClick={() => onLightbox(message.file_url!)}>
                    <Image src={message.file_url!} alt="" width={300} height={300} loading="lazy" className="object-cover max-h-[400px] w-full" />
                    {message.text && message.text !== '[Encrypted Message]' && <p className="mt-2 text-sm">{message.text}</p>}
                  </div>
                )}

                {message.type === 'video' && <LazyVideo src={message.file_url!} />}

                {message.type === 'audio' && <CustomAudioPlayer src={message.file_url!} />}

                {message.type === 'file' && (
                  <div className={clsx("flex items-center gap-4 p-3 rounded-2xl", isMe ? "bg-white/10" : "bg-gray-50")}>
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white"><FileText size={24} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{message.text}</p>
                      <p className="text-[10px] opacity-60">Document</p>
                    </div>
                    <a href={message.file_url!} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/10"><Download size={20} /></a>
                  </div>
                )}

                {message.type === 'call' && (
                   <div className="flex items-center gap-3">
                      <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", isMe ? "bg-white/20" : "bg-indigo-50 text-indigo-500")}>
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
            <div className={clsx("flex items-center gap-1.5 mt-1.5 justify-end", isMe ? "text-white/60" : "text-gray-400")}>
              <span className="text-[10px] font-medium">{formatMsgTime(message.created_at)}</span>
              {message.edited_at && <span className="text-[9px] font-black uppercase">Edited</span>}
              {isMe && <MessageStatusTicks status={message.status} />}
              {isStarred && <Star size={10} fill="currentColor" />}
            </div>
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
