
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
  
  addChatVideo: (video) => set((state) => ({
    chatVideos: [...state.chatVideos, video]
  })),
  
  removeChatVideo: (id) => set((state) => ({
    chatVideos: state.chatVideos.filter(v => v.id !== id)
  })),
  
  getChatVideo: (id) => {
    return get().chatVideos.find(v => v.id === id);
  }
}));

export default useVideoStore;
