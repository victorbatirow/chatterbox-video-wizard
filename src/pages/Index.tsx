
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import VideoViewer from "@/components/VideoViewer";

const Index = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleVideoGeneration = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate video generation delay
    setTimeout(() => {
      setCurrentVideo("https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4");
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Chat Interface - Left Side */}
      <div className="w-1/2 border-r border-white/10">
        <ChatInterface 
          onGenerateVideo={handleVideoGeneration}
          isGenerating={isGenerating}
        />
      </div>
      
      {/* Video Viewer - Right Side */}
      <div className="w-1/2">
        <VideoViewer 
          videoUrl={currentVideo}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default Index;
