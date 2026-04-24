import { useReducer } from 'react';
import { Profile, Message } from '@/types';

export type ChatView = 'welcome' | 'list' | 'chat' | 'calls' | 'details';

export interface ChatState {
  view: ChatView;
  isSidebarCollapsed: boolean;
  sidebarWidth: number;
  showMenu: boolean;
  showEmojiPanel: boolean;
  showGifPicker: boolean;
  showAttachmentMenu: boolean;
  showMediaGallery: boolean;
  activeMediaTab: 'Images' | 'Videos' | 'Docs';
  lightboxImage: string | null;
  showSpecialDates: boolean;
  showStarred: boolean;
  showSetup: boolean;
  showLogoutConfirm: boolean;
  showClearConfirm: boolean;
  showWallpaperSheet: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: string[];
  searchIndex: number;
  otherUserTyping: 'typing' | 'recording' | null;
  onlineUsers: string[];
  activeCall: { type: 'outgoing' | 'incoming', target: Profile, call?: { id: string; [key: string]: unknown } } | null;
  unreadCount: number;
  inputText: string;
  replyTo: Message | null;
  editingMessage: Message | null;
  starredIds: string[];
}

export type ChatAction = 
  | { type: 'SET_VIEW'; payload: ChatView }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_SIDEBAR_WIDTH'; payload: number }
  | { type: 'TOGGLE_MENU'; payload?: boolean }
  | { type: 'SET_EMOJI_PANEL'; payload: boolean }
  | { type: 'SET_GIF_PICKER'; payload: boolean }
  | { type: 'SET_ATTACHMENT_MENU'; payload: boolean }
  | { type: 'SET_MEDIA_GALLERY'; payload: boolean }
  | { type: 'SET_MEDIA_TAB'; payload: 'Images' | 'Videos' | 'Docs' }
  | { type: 'SET_LIGHTBOX_IMAGE'; payload: string | null }
  | { type: 'SET_SPECIAL_DATES'; payload: boolean }
  | { type: 'SET_SHOW_STARRED'; payload: boolean }
  | { type: 'SET_SHOW_SETUP'; payload: boolean }
  | { type: 'SET_LOGOUT_CONFIRM'; payload: boolean }
  | { type: 'SET_CLEAR_CONFIRM'; payload: boolean }
  | { type: 'SET_WALLPAPER_SHEET'; payload: boolean }
  | { type: 'SET_SEARCH_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: string[] }
  | { type: 'SET_SEARCH_INDEX'; payload: number }
  | { type: 'SET_TYPING'; payload: 'typing' | 'recording' | null }
  | { type: 'SET_ONLINE_USERS'; payload: string[] }
  | { type: 'SET_ACTIVE_CALL'; payload: ChatState['activeCall'] }
  | { type: 'SET_UNREAD_COUNT'; payload: number | ((prev: number) => number) }
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_REPLY_TO'; payload: Message | null }
  | { type: 'SET_EDITING_MESSAGE'; payload: Message | null }
  | { type: 'TOGGLE_STAR'; payload: string }
  | { type: 'SET_STARRED_IDS'; payload: string[] };

const initialState: ChatState = {
  view: 'welcome',
  isSidebarCollapsed: false,
  sidebarWidth: 380,
  showMenu: false,
  showEmojiPanel: false,
  showGifPicker: false,
  showAttachmentMenu: false,
  showMediaGallery: false,
  activeMediaTab: 'Images',
  lightboxImage: null,
  showSpecialDates: false,
  showStarred: false,
  showSetup: false,
  showLogoutConfirm: false,
  showClearConfirm: false,
  showWallpaperSheet: false,
  isSearchOpen: false,
  searchQuery: '',
  searchResults: [],
  searchIndex: 0,
  otherUserTyping: null,
  onlineUsers: [],
  activeCall: null,
  unreadCount: 0,
  inputText: '',
  replyTo: null,
  editingMessage: null,
  starredIds: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, view: action.payload };
    case 'SET_SIDEBAR_COLLAPSED': return { ...state, isSidebarCollapsed: action.payload };
    case 'SET_SIDEBAR_WIDTH': return { ...state, sidebarWidth: action.payload };
    case 'TOGGLE_MENU': return { ...state, showMenu: action.payload ?? !state.showMenu };
    case 'SET_EMOJI_PANEL': return { ...state, showEmojiPanel: action.payload };
    case 'SET_GIF_PICKER': return { ...state, showGifPicker: action.payload };
    case 'SET_ATTACHMENT_MENU': return { ...state, showAttachmentMenu: action.payload };
    case 'SET_MEDIA_GALLERY': return { ...state, showMediaGallery: action.payload };
    case 'SET_MEDIA_TAB': return { ...state, activeMediaTab: action.payload };
    case 'SET_LIGHTBOX_IMAGE': return { ...state, lightboxImage: action.payload };
    case 'SET_SPECIAL_DATES': return { ...state, showSpecialDates: action.payload };
    case 'SET_SHOW_STARRED': return { ...state, showStarred: action.payload };
    case 'SET_SHOW_SETUP': return { ...state, showSetup: action.payload };
    case 'SET_LOGOUT_CONFIRM': return { ...state, showLogoutConfirm: action.payload };
    case 'SET_CLEAR_CONFIRM': return { ...state, showClearConfirm: action.payload };
    case 'SET_WALLPAPER_SHEET': return { ...state, showWallpaperSheet: action.payload };
    case 'SET_SEARCH_OPEN': return { ...state, isSearchOpen: action.payload };
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_RESULTS': return { ...state, searchResults: action.payload };
    case 'SET_SEARCH_INDEX': return { ...state, searchIndex: action.payload };
    case 'SET_TYPING': return { ...state, otherUserTyping: action.payload };
    case 'SET_ONLINE_USERS': return { ...state, onlineUsers: action.payload };
    case 'SET_ACTIVE_CALL': return { ...state, activeCall: action.payload };
    case 'SET_UNREAD_COUNT': 
      const nextUnread = typeof action.payload === 'function' ? action.payload(state.unreadCount) : action.payload;
      return { ...state, unreadCount: nextUnread };
    case 'SET_INPUT_TEXT': return { ...state, inputText: action.payload };
    case 'SET_REPLY_TO': return { ...state, replyTo: action.payload };
    case 'SET_EDITING_MESSAGE': return { ...state, editingMessage: action.payload };
    case 'TOGGLE_STAR': 
      const ids = state.starredIds.includes(action.payload) 
        ? state.starredIds.filter(id => id !== action.payload) 
        : [...state.starredIds, action.payload];
      return { ...state, starredIds: ids };
    case 'SET_STARRED_IDS': return { ...state, starredIds: action.payload };
    default: return state;
  }
}

export const useChatReducer = () => {
  return useReducer(chatReducer, initialState);
};
