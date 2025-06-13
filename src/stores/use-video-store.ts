
import { create } from "zustand";

export interface ChatVideo {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  preview?: string;
}

interface VideoStore {
  chatVideos: ChatVideo[];
  addChatVideo: (video: ChatVideo) => void;
  removeChatVideo: (id: string) => void;
  getChatVideo: (id: string) => ChatVideo | undefined;
}

const useVideoStore = create<VideoStore>((set, get) => ({
  chatVideos: [],
  
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
  }
}));

export default useVideoStore;
