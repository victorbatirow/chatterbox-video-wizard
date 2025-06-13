
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
  addChatVideo: (video: ChatVideo) => void;
  removeChatVideo: (id: string) => void;
  getChatVideo: (id: string) => ChatVideo | undefined;
  setHighlightedVideoIds: (ids: string[]) => void;
  scrollToVideos: (videoIds: string[]) => void;
}

const useVideoStore = create<VideoStore>((set, get) => ({
  chatVideos: [],
  highlightedVideoIds: [],
  
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
  
  scrollToVideos: (videoIds) => {
    // Dispatch custom event for video highlighting
    const event = new CustomEvent('highlightVideos', { 
      detail: { videoIds } 
    });
    window.dispatchEvent(event);
    
    // Set highlighted videos
    set({ highlightedVideoIds: videoIds });
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      set({ highlightedVideoIds: [] });
    }, 3000);
  }
}));

export default useVideoStore;
