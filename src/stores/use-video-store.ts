
import { create } from "zustand";

export interface ChatVideo {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  preview?: string;
  messageId?: string; // Add messageId to track which message generated this video
}

interface VideoStore {
  chatVideos: ChatVideo[];
  highlightedVideoIds: string[];
  highlightTimeoutId: NodeJS.Timeout | null;
  addChatVideo: (video: ChatVideo) => void;
  removeChatVideo: (id: string) => void;
  getChatVideo: (id: string) => ChatVideo | undefined;
  setHighlightedVideoIds: (ids: string[]) => void;
  scrollToVideos: (videoIds: string[]) => void;
  clearHighlights: () => void;
  clearAllChatVideos: () => void;
}

const useVideoStore = create<VideoStore>((set, get) => ({
  chatVideos: [],
  highlightedVideoIds: [],
  highlightTimeoutId: null,
  
  addChatVideo: (video) => {
    console.log('Video store: Adding video', video);
    set((state) => {
      const newState = {
        chatVideos: [...state.chatVideos, video]
      };
      console.log('Video store: New state', newState);
      return newState;
    });
  },
  
  removeChatVideo: (id) => set((state) => ({
    chatVideos: state.chatVideos.filter(v => v.id !== id)
  })),
  
  getChatVideo: (id) => {
    return get().chatVideos.find(v => v.id === id);
  },
  
  setHighlightedVideoIds: (ids) => set({ highlightedVideoIds: ids }),
  
  clearHighlights: () => {
    const state = get();
    if (state.highlightTimeoutId) {
      clearTimeout(state.highlightTimeoutId);
    }
    set({ 
      highlightedVideoIds: [], 
      highlightTimeoutId: null 
    });
  },
  
  clearAllChatVideos: () => {
    console.log('Video store: Clearing all chat videos');
    set({ 
      chatVideos: [],
      highlightedVideoIds: [],
      highlightTimeoutId: null
    });
  },
  
  scrollToVideos: (videoIds) => {
    console.log('Video store: scrollToVideos called with:', videoIds);
    
    // Clear any existing highlights and timeouts
    const state = get();
    if (state.highlightTimeoutId) {
      console.log('Video store: Clearing existing timeout');
      clearTimeout(state.highlightTimeoutId);
    }
    
    // Set new highlighted videos immediately
    console.log('Video store: Setting highlighted videos:', videoIds);
    set({ 
      highlightedVideoIds: videoIds,
      highlightTimeoutId: null
    });
    
    // Dispatch custom event for video highlighting and scrolling
    const event = new CustomEvent('highlightVideos', { 
      detail: { videoIds } 
    });
    window.dispatchEvent(event);
    
    // Set up new timeout to clear highlights after exactly 3 seconds
    const timeoutId = setTimeout(() => {
      console.log('Video store: Clearing highlights after 3 seconds');
      set({ 
        highlightedVideoIds: [], 
        highlightTimeoutId: null 
      });
    }, 3000);
    
    // Store the timeout ID so we can clear it if needed
    set({ highlightTimeoutId: timeoutId });
  }
}));

export default useVideoStore;
