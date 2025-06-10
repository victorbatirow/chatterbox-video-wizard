
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import VideoTimeline from "@/components/VideoTimeline";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export interface VideoMessage {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
}

const Chat = () => {
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleVideoGeneration = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate video generation delay
    setTimeout(() => {
      const newVideo: VideoMessage = {
        id: Date.now().toString(),
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        prompt,
        timestamp: new Date(),
      };
      
      setVideos(prev => [...prev, newVideo]);
      setCurrentVideoId(newVideo.id);
      setIsGenerating(false);
    }, 3000);
  };

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        {/* Chat Interface - Resizable Panel */}
        <ResizablePanel defaultSize={33} minSize={25} maxSize={50}>
          <ChatInterface 
            onGenerateVideo={handleVideoGeneration}
            onVideoSelect={handleVideoSelect}
            isGenerating={isGenerating}
            videos={videos}
          />
        </ResizablePanel>
        
        {/* Draggable Handle */}
        <ResizableHandle withHandle />
        
        {/* Video Timeline - Resizable Panel */}
        <ResizablePanel defaultSize={67} minSize={50}>
          <VideoTimeline 
            videos={videos}
            currentVideoId={currentVideoId}
            isGenerating={isGenerating}
            onVideoSelect={handleVideoSelect}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Chat;
