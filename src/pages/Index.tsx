
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import VideoViewer from "@/components/VideoViewer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        {/* Chat Interface - Resizable Panel */}
        <ResizablePanel defaultSize={33} minSize={25} maxSize={33}>
          <ChatInterface 
            onGenerateVideo={handleVideoGeneration}
            isGenerating={isGenerating}
          />
        </ResizablePanel>
        
        {/* Draggable Handle */}
        <ResizableHandle withHandle />
        
        {/* Video Viewer - Resizable Panel */}
        <ResizablePanel defaultSize={67} minSize={67}>
          <VideoViewer 
            videoUrl={currentVideo}
            isGenerating={isGenerating}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
