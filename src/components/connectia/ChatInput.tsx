import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, Mic, Send, X, Image as ImageIcon, Smile as SmileIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { Message, Profile } from '@/types';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: (text: string, type?: Message['type'], fileUrl?: string, metadata?: { replyTo?: string, file?: File }) => void;
  handleTyping: (state: 'typing' | 'recording' | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (s: boolean) => void;
  showEmojiPanel: boolean;
  setShowEmojiPanel: (s: boolean) => void;
  replyTo: Message | null;
  setReplyTo: (m: Message | null) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => void;
  attachmentRef: React.RefObject<HTMLInputElement>;
  currentUser: Profile | null;
}

export const ChatInput = ({
  inputText, setInputText, sendMessage, handleTyping,
  startRecording, stopRecording, isRecording,
  showAttachmentMenu, setShowAttachmentMenu,
  showEmojiPanel, setShowEmojiPanel,
  replyTo, setReplyTo,
  onFileSelect, attachmentRef, currentUser
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() && !isRecording) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      // 1. INSTANT UI ECHO: Clear input before React re-render
      if (textareaRef.current) textareaRef.current.value = "";
      const textToSend = inputText;
      
      // 2. TRIGGER PIPELINE
      sendMessage(textToSend, 'text', undefined, { replyTo: replyTo?.id });
      
      // 3. BACKGROUND STATE CLEANUP
      setInputText("");
      setReplyTo(null);
      
      // Mobile feedback
      if ('vibrate' in navigator) navigator.vibrate(5);
    }
  };

  return (
    <div className="p-4 bg-[var(--bg-primary)] border-t border-white/5 safe-bottom">
       <AnimatePresence>
         {replyTo && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
             className="mb-3 p-3 bg-white/5 rounded-2xl flex items-center justify-between gap-4 border border-white/5"
           >
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase text-indigo-400 mb-0.5">Replying to {replyTo.sender_id === currentUser?.id ? 'Yourself' : 'Partner'}</p>
               <p className="text-sm text-white/60 truncate leading-snug">{replyTo.text}</p>
             </div>
             <button 
               onClick={() => setReplyTo(null)} 
               className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40"
               aria-label="Cancel reply"
             >
               <X size={18} />
             </button>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="flex items-end gap-3 relative">
         <div className="relative">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.vibrate?.(5);
                setShowAttachmentMenu(!showAttachmentMenu);
              }}
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                showAttachmentMenu ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"
              )}
              aria-label="Attachments"
              aria-expanded={showAttachmentMenu}
            >
              <Paperclip size={22} />
            </motion.button>
            
            <AnimatePresence>
              {showAttachmentMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                  animate={{ opacity: 1, scale: 1, y: -60 }} 
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-0 left-0 flex flex-col gap-2 z-50"
                >
                  <button 
                    onClick={() => {
                      attachmentRef.current?.click();
                      setShowAttachmentMenu(false);
                    }} 
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform"
                    aria-label="Attach file"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input ref={attachmentRef} type="file" className="hidden" multiple onChange={(e) => onFileSelect(e, 'file')} />
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <div className="flex-1 bg-white/5 rounded-[1.5rem] px-4 py-3 flex items-end gap-3 relative transition-all focus-within:bg-white/10 border border-transparent focus-within:border-white/10">
            <button 
              onClick={() => setShowEmojiPanel(!showEmojiPanel)} 
              className="w-10 h-10 shrink-0 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors"
              aria-label="Emoji picker"
            >
              <SmileIcon size={22} />
            </button>
            <textarea 
              ref={textareaRef}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-white placeholder:text-white/20 resize-none max-h-[120px] scrollbar-hide py-2 overscroll-contain"
              rows={1}
              value={inputText}
              onChange={(e) => { 
                setInputText(e.target.value); 
                handleTyping(e.target.value.length > 0 ? 'typing' : null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
         </div>

         <div className="flex items-center">
            {inputText.trim() || isRecording ? (
              <motion.button 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.vibrate?.(10);
                  handleSend();
                }}
                className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all"
                aria-label="Send message"
              >
                <Send size={20} />
              </motion.button>
            ) : (
              <motion.button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isRecording ? "bg-rose-500 text-white animate-pulse scale-125 shadow-2xl" : "bg-white/5 text-white/40 hover:text-white"
                )}
                aria-label="Voice message"
              >
                <Mic size={22} />
              </motion.button>
            )}
         </div>
       </div>
    </div>
  );
};
