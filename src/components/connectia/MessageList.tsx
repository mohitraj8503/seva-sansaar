import React, { memo, useEffect, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
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
}

export const MessageList = memo(({
  flatMessages, onScroll, currentUser, messageMap, searchResults, starredIds
}: MessageListProps) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const {
    setReplyTo, handleDeleteMe, handleDeleteEveryone,
    setEditingMessage, setInputText, toggleStar,
    setLightboxImage, updateMessage
  } = useChatStore();

  useEffect(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: flatMessages.length - 1, behavior: 'smooth' });
    }
  }, [flatMessages.length]);

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
      />
    );
  };

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={flatMessages}
      initialTopMostItemIndex={flatMessages.length - 1}
      itemContent={(index) => renderItem(index)}
      atBottomStateChange={onScroll}
      followOutput="smooth"
      className="scrollbar-hide px-2 md:px-0 h-full w-full"
      style={{ height: '100%', width: '100%' }}
      increaseViewportBy={200}
    />
  );
});

MessageList.displayName = 'MessageList';
