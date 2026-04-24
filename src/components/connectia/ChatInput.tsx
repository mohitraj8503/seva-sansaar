import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, Mic, Send, X, Image as ImageIcon, Video, FileText, Smile as SmileIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { Message, Profile } from '@/types';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'file' | 'video' | 'call') => void;
  handleTyping: (state: 'typing' | 'recording' | null) => void;
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (s: boolean) => void;
  showEmojiPanel: boolean;
  setShowEmojiPanel: (s: boolean) => void;
  replyTo: Message | null;
  setReplyTo: (m: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (m: Message | null) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => void;
  attachmentRef: React.RefObject<HTMLInputElement>;
  currentUser: Profile | null;
}

export const ChatInput = ({
  inputText, setInputText, sendMessage, handleTyping,
  startRecording, stopRecording, isRecording, recordingSeconds,
  showAttachmentMenu, setShowAttachmentMenu,
  showEmojiPanel, setShowEmojiPanel,
  replyTo, setReplyTo, editingMessage, setEditingMessage,
  onFileSelect, attachmentRef, currentUser
}: ChatInputProps) => {
  return (
    <div className="p-4 md:p-8 bg-white/80 backdrop-blur-2xl border-t border-gray-100/50 safe-bottom">
       <AnimatePresence>
         {replyTo && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
             className="mb-4 p-4 bg-gray-50 rounded-3xl flex items-center justify-between gap-4 border border-gray-100"
           >
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">Replying to {replyTo.sender_id === currentUser?.id ? 'Yourself' : 'Partner'}</p>
               <p className="text-sm text-gray-500 truncate">{replyTo.text}</p>
             </div>
             <button onClick={() => setReplyTo(null)} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400"><X size={18} /></button>
           </motion.div>
         )}
         {editingMessage && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
             className="mb-4 p-4 bg-indigo-50 rounded-3xl flex items-center justify-between gap-4 border border-indigo-100"
           >
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase text-indigo-600 mb-1">Editing Message</p>
               <p className="text-sm text-indigo-400 truncate">{editingMessage.text}</p>
             </div>
             <button onClick={() => { setEditingMessage(null); setInputText(""); }} className="w-8 h-8 rounded-full hover:bg-indigo-100 flex items-center justify-center text-indigo-400"><X size={18} /></button>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="flex items-center gap-3 md:gap-4 relative">
         <div className="relative">
           <button 
             onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
             className={clsx(
               "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
               showAttachmentMenu ? "bg-black text-white" : "bg-gray-100 text-gray-400 hover:text-black"
             )}
           >
             <Paperclip size={24} />
           </button>
           
           <AnimatePresence>
             {showAttachmentMenu && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: -80 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
                 className="absolute bottom-0 left-0 flex flex-col gap-2 z-50"
               >
                 {[
                   { icon: <ImageIcon size={20} />, label: 'Gallery', type: 'image' },
                   { icon: <Video size={20} />, label: 'Video', type: 'video' },
                   { icon: <FileText size={20} />, label: 'Document', type: 'file' }
                 ].map((item, idx) => (
                   <button 
                     key={idx}
                     onClick={() => attachmentRef.current?.click()}
                     className="w-12 h-12 md:w-14 md:h-14 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                   >
                     {item.icon}
                   </button>
                 ))}
                 <input ref={attachmentRef} type="file" className="hidden" multiple onChange={(e) => onFileSelect(e, 'file')} />
               </motion.div>
             )}
           </AnimatePresence>
         </div>

         <div className="flex-1 bg-gray-100/80 rounded-[2.5rem] px-6 py-3 md:py-4 flex items-center gap-3 relative transition-all focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-indigo-100/50 border border-transparent focus-within:border-indigo-100">
           <button 
            onClick={() => setShowEmojiPanel(!showEmojiPanel)}
            className="text-gray-400 hover:text-amber-500 transition-colors"
           >
             <SmileIcon size={24} />
           </button>
           <textarea 
             placeholder="Type a message..."
             className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-black placeholder:text-gray-400 resize-none max-h-[120px] scrollbar-hide py-1"
             rows={1}
             value={inputText}
             onChange={(e) => { 
               setInputText(e.target.value); 
               handleTyping(e.target.value.length > 0 ? 'typing' : null);
             }}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 sendMessage(inputText);
               }
             }}
           />
         </div>

         <div className="flex items-center gap-2">
           {inputText.trim() || isRecording ? (
             <motion.button 
               initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               onClick={() => {
                 if (isRecording) stopRecording();
                 else sendMessage(inputText);
               }}
               className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-95 transition-all"
             >
               <Send size={24} />
             </motion.button>
           ) : (
             <motion.button 
               initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               onMouseDown={startRecording}
               onMouseUp={stopRecording}
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               className={clsx(
                 "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                 isRecording ? "bg-rose-500 text-white animate-pulse scale-125 shadow-2xl shadow-rose-200" : "bg-gray-100 text-gray-400 hover:text-black"
               )}
             >
               <Mic size={24} />
             </motion.button>
           )}
         </div>

         <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="absolute right-20 bg-rose-500 text-white px-4 py-2 rounded-full text-xs font-black tracking-widest flex items-center gap-2 shadow-xl shadow-rose-200"
              >
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                 {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  );
};
