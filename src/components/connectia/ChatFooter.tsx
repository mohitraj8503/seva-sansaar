import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatInput } from './ChatInput';
import { GifPicker } from './GifPicker';
import { Message, Profile } from '@/types';

interface ChatFooterProps {
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
  showGifPicker: boolean;
  setShowGifPicker: (s: boolean) => void;
  replyTo: Message | null;
  setReplyTo: (m: Message | null) => void;
  isUploadingAudio: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => void;
  attachmentRef: React.RefObject<HTMLInputElement>;
  currentUser: Profile | null;
  messages: Message[];
}

export const ChatFooter = (props: ChatFooterProps) => {
  return (
    <div className="relative">
      <AnimatePresence>
        {props.showGifPicker && (
          <GifPicker 
            onSelect={(url) => { 
              props.sendMessage(url, 'image');
              props.setShowGifPicker(false); 
            }} 
            onClose={() => props.setShowGifPicker(false)} 
          />
        )}
      </AnimatePresence>
      
      <ChatInput 
        inputText={props.inputText}
        setInputText={props.setInputText}
        sendMessage={props.sendMessage}
        handleTyping={props.handleTyping}
        startRecording={props.startRecording}
        stopRecording={props.stopRecording}
        isRecording={props.isRecording}
        showAttachmentMenu={props.showAttachmentMenu}
        setShowAttachmentMenu={props.setShowAttachmentMenu}
        showEmojiPanel={props.showEmojiPanel}
        setShowEmojiPanel={props.setShowEmojiPanel}
        replyTo={props.replyTo}
        setReplyTo={props.setReplyTo}
        onFileSelect={props.onFileSelect}
        attachmentRef={props.attachmentRef}
        currentUser={props.currentUser}
      />
    </div>
  );
};
