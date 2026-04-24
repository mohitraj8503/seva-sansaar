import { create } from 'zustand';
import { Message, Profile, Call } from '@/types';

export type ChatView = 'welcome' | 'list' | 'chat' | 'calls' | 'details';

interface ChatStore {
  // --- STATE ---
  view: ChatView;
  isUnlocked: boolean;
  currentUser: Profile | null;
  activePartner: Profile | null;
  sharedSecret: Uint8Array | null;
  
  messages: Message[];
  isLoadingMessages: boolean;
  hasMore: boolean;
  
  onlineUsers: string[];
  otherUserTyping: 'typing' | 'recording' | null;
  activeCall: { type: 'outgoing' | 'incoming', target: Profile, call?: Call } | null;
  
  unreadCounts: Record<string, number>;
  lastMessages: Record<string, Message>;
  
  showMenu: boolean;
  showAttachmentMenu: boolean;
  showEmojiPanel: boolean;
  showGifPicker: boolean;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  
  // UI State
  inputText: string;
  replyTo: Message | null;
  editingMessage: Message | null;
  showMediaGallery: boolean;
  activeMediaTab: 'Images' | 'Videos' | 'Docs';
  lightboxImage: string | null;
  showSpecialDates: boolean;
  showStarred: boolean;
  starredIds: string[];
  showSetup: boolean;
  showLogoutConfirm: boolean;
  showClearConfirm: boolean;
  showWallpaperSheet: boolean;
  wallpaper: string | null;
  wallpaperUrl: string | null;
  isMuted: boolean;
  expiryTime: number | null;
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: string[];
  searchIndex: number;

  // --- ACTIONS ---
  setView: (view: ChatView) => void;
  setUnlocked: (unlocked: boolean) => void;
  setCurrentUser: (user: Profile | null | ((prev: Profile | null) => Profile | null)) => void;
  setActivePartner: (partner: Profile | null) => void;
  setSharedSecret: (secret: Uint8Array | null) => void;
  
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  handleDeleteMe: (id: string) => Promise<void>;
  handleDeleteEveryone: (id: string) => Promise<void>;
  
  setOnlineUsers: (users: string[]) => void;
  setOtherUserTyping: (state: 'typing' | 'recording' | null) => void;
  setActiveCall: (call: ChatStore['activeCall']) => void;
  
  setUnreadCount: (userId: string, count: number | ((prev: number) => number)) => void;
  setLastMessage: (userId: string, message: Message) => void;
  
  setInputText: (text: string) => void;
  setReplyTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  
  setShowMenu: (show: boolean) => void;
  setShowAttachmentMenu: (show: boolean) => void;
  setShowEmojiPanel: (show: boolean) => void;
  setShowGifPicker: (show: boolean) => void;
  
  // Security
  lockChat: () => void;
  
  // UI Actions
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowMediaGallery: (show: boolean) => void;
  setActiveMediaTab: (tab: 'Images' | 'Videos' | 'Docs') => void;
  setLightboxImage: (url: string | null) => void;
  setShowSpecialDates: (show: boolean) => void;
  setShowStarred: (show: boolean) => void;
  setStarredIds: (ids: string[]) => void;
  toggleStar: (id: string) => void;
  setShowSetup: (show: boolean) => void;
  setShowLogoutConfirm: (show: boolean) => void;
  setShowClearConfirm: (show: boolean) => void;
  setShowWallpaperSheet: (show: boolean) => void;
  setWallpaper: (wp: string | null) => void;
  setWallpaperUrl: (url: string | null) => void;
  setIsMuted: (muted: boolean) => void;
  setExpiryTime: (time: number | null) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  setSearchIndex: (index: number) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // --- INITIAL STATE ---
  view: 'welcome',
  isUnlocked: false,
  currentUser: null,
  activePartner: null,
  sharedSecret: null,
  
  messages: [],
  isLoadingMessages: false,
  hasMore: true,
  
  onlineUsers: [],
  otherUserTyping: null,
  activeCall: null,
  
  unreadCounts: {},
  lastMessages: {},
  
  showMenu: false,
  showAttachmentMenu: false,
  showEmojiPanel: false,
  showGifPicker: false,
  sidebarWidth: 380,
  isSidebarCollapsed: false,
  
  inputText: '',
  replyTo: null,
  editingMessage: null,
  showMediaGallery: false,
  activeMediaTab: 'Images',
  lightboxImage: null,
  showSpecialDates: false,
  showStarred: false,
  starredIds: [],
  showSetup: false,
  showLogoutConfirm: false,
  showClearConfirm: false,
  showWallpaperSheet: false,
  wallpaper: null,
  wallpaperUrl: null,
  isMuted: false,
  expiryTime: null,
  isSearchOpen: false,
  searchQuery: '',
  searchResults: [],
  searchIndex: 0,

  // --- ACTIONS ---
  setView: (view) => set({ view }),
  setUnlocked: (isUnlocked) => set({ isUnlocked }),
  setCurrentUser: (currentUser) => set((state) => ({
    currentUser: typeof currentUser === 'function' ? currentUser(state.currentUser) : currentUser
  })),
  setActivePartner: (activePartner) => set({ activePartner }),
  setSharedSecret: (sharedSecret) => set({ sharedSecret }),
  
  setMessages: (messages) => set((state) => ({ 
    messages: typeof messages === 'function' ? messages(state.messages) : messages 
  })),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  
  handleDeleteMe: async (id) => {
    const { MessageService } = await import('@/services/connectia/messageService');
    const { currentUser } = useChatStore.getState();
    if (!currentUser) return;
    await MessageService.deleteForMe(id, currentUser.id);
    set((state) => ({
      messages: state.messages.filter(m => m.id !== id)
    }));
  },
  
  handleDeleteEveryone: async (id) => {
    const { MessageService } = await import('@/services/connectia/messageService');
    await MessageService.deleteForEveryone(id);
    set((state) => ({
      messages: state.messages.filter(m => m.id !== id)
    }));
  },
  
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setOtherUserTyping: (otherUserTyping) => set({ otherUserTyping }),
  setActiveCall: (activeCall) => set({ activeCall }),
  
  setUnreadCount: (userId, count) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [userId]: typeof count === 'function' ? count(state.unreadCounts[userId] || 0) : count
    }
  })),
  setLastMessage: (userId, message) => set((state) => ({
    lastMessages: {
      ...state.lastMessages,
      [userId]: message
    }
  })),
  
  setInputText: (inputText) => set({ inputText }),
  setReplyTo: (replyTo) => set({ replyTo }),
  setEditingMessage: (editingMessage) => set({ editingMessage }),
  
  setShowMenu: (showMenu) => set({ showMenu }),
  setShowAttachmentMenu: (showAttachmentMenu) => set({ showAttachmentMenu }),
  setShowEmojiPanel: (showEmojiPanel) => set({ showEmojiPanel }),
  setShowGifPicker: (showGifPicker) => set({ showGifPicker }),
  
  lockChat: () => set({ 
    isUnlocked: false, 
    messages: [], 
    activePartner: null,
    sharedSecret: null 
  }),
  
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setShowMediaGallery: (showMediaGallery) => set({ showMediaGallery }),
  setActiveMediaTab: (activeMediaTab) => set({ activeMediaTab }),
  setLightboxImage: (lightboxImage) => set({ lightboxImage }),
  setShowSpecialDates: (showSpecialDates) => set({ showSpecialDates }),
  setShowStarred: (showStarred) => set({ showStarred }),
  setStarredIds: (starredIds) => set({ starredIds }),
  toggleStar: (id) => set((state) => ({
    starredIds: state.starredIds.includes(id) 
      ? state.starredIds.filter(sid => sid !== id) 
      : [...state.starredIds, id]
  })),
  setShowSetup: (showSetup) => set({ showSetup }),
  setShowLogoutConfirm: (showLogoutConfirm) => set({ showLogoutConfirm }),
  setShowClearConfirm: (showClearConfirm) => set({ showClearConfirm }),
  setShowWallpaperSheet: (showWallpaperSheet) => set({ showWallpaperSheet }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  setWallpaperUrl: (wallpaperUrl) => set({ wallpaperUrl }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setExpiryTime: (expiryTime) => set({ expiryTime }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchIndex: (searchIndex) => set({ searchIndex }),
}));
