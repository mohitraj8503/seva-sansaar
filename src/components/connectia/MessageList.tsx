import React, { memo, useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { ArrowDown } from 'lucide-react';
import { Message, Profile } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/store/useChatStore';

interface MessageListProps {
  flatMessages: Array<{ type: 'date'; date: string } | { type: 'message'; msg: Message } | { type: 'typing'; state: 'typing' | 'recording' }>;
  onScroll?: (isAtBottom: boolean) => void;
  currentUser: Profile | null;
  messageMap: Record<string, Message>;
  searchResults: string[];
  starredIds: string[];
  onRetry: (m: Message) => void;
}

export interface MessageListHandle {
  scrollToBottom: () => void;
}

export const MessageList = memo(forwardRef<MessageListHandle, MessageListProps>(({
  flatMessages, onScroll, currentUser, messageMap, searchResults, starredIds, onRetry
}, ref) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const prevMessagesLength = useRef(flatMessages.length);

  const {
    setReplyTo, handleDeleteMe, handleDeleteEveryone,
    setEditingMessage, setInputText, toggleStar,
    setLightboxImage, updateMessage
  } = useChatStore();

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({ index: flatMessages.length - 1, behavior: 'smooth' });
    setShowNewMessageButton(false);
  }, [flatMessages.length]);

  useImperativeHandle(ref, () => ({
    scrollToBottom
  }));

  useEffect(() => {
    const isNewMessage = flatMessages.length > prevMessagesLength.current;
    
    if (isNewMessage) {
      if (atBottom) {
        scrollToBottom();
      } else {
        setShowNewMessageButton(true);
      }
    }
    
    prevMessagesLength.current = flatMessages.length;
  }, [flatMessages.length, atBottom, scrollToBottom]);

  const renderItem = (index: number) => {
    const item = flatMessages[index];
    if (!item) return null;

    if (item.type === 'date') {
      return (
        <div className="flex items-center justify-center py-6">
          <div className="px-4 py-1.5 bg-gray-100/50 backdrop-blur-sm rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
            {item.date}
          </div>
        </div>
      );
    }

    if (item.type === 'typing') {
      return (
        <div className="px-8 py-2">
          <TypingIndicator state={item.state} />
        </div>
      );
    }

    const m = item.msg;
    return (
      <MessageBubble 
        message={m}
        isMe={m.sender_id === currentUser?.id}
        onReact={(id, emoji) => {
           const oldReactions = { ...(m.reactions || {}) };
           const newReactions = { ...oldReactions };
           const userId = currentUser?.id || '';
           if (newReactions[userId] === emoji) {
             delete newReactions[userId];
           } else {
             newReactions[userId] = emoji;
           }
           updateMessage(id, { reactions: newReactions });
        }}
        onReply={setReplyTo}
        onDeleteMe={handleDeleteMe}
        onDeleteEveryone={handleDeleteEveryone}
        onEdit={(msg) => { setEditingMessage(msg); setInputText(msg.text); }}
        onCopy={(t) => { navigator.clipboard.writeText(t); }}
        onStar={toggleStar}
        onLightbox={setLightboxImage}
        onSeen={(id) => updateMessage(id, { status: 'seen', seen: true })}
        replyToMessage={m.reply_to ? messageMap[m.reply_to] : undefined}
        isStarred={starredIds.includes(m.id)}
        isSearchResult={searchResults.includes(m.id)}
        onRetry={onRetry}
      />
    );
  };

  return (
    <div className="relative h-full w-full">
      <Virtuoso
        ref={virtuosoRef}
        data={flatMessages}
        initialTopMostItemIndex={flatMessages.length - 1}
        itemContent={(index) => renderItem(index)}
        atBottomStateChange={(isAtBottom) => {
          setAtBottom(isAtBottom);
          if (isAtBottom) setShowNewMessageButton(false);
          onScroll?.(isAtBottom);
        }}
        atBottomThreshold={200}
        className="scrollbar-hide px-2 md:px-0 h-full w-full"
        style={{ height: '100%', width: '100%' }}
        increaseViewportBy={400}
      />

      {showNewMessageButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-2xl animate-bounce z-50 flex items-center gap-2 px-4"
        >
          <ArrowDown size={18} />
          <span className="text-xs font-black uppercase tracking-wider">New Messages</span>
        </button>
      )}
    </div>
  );
}));

MessageList.displayName = 'MessageList';
