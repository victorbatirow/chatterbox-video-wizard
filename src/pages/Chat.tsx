
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import VideoTimeline from "@/components/VideoTimeline";
import ProjectMenu from "@/components/ProjectMenu";
import SettingsDialog from "@/components/SettingsDialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export interface VideoMessage {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  // Check for initial prompt from URL parameters
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      // Clear the URL parameter
      setSearchParams(new URLSearchParams());
      // Send the initial prompt
      handleSendMessage(initialPrompt);
    }
  }, [searchParams]);

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Create a video for this message
      const videoId = (Date.now() + 1000).toString();
      const newVideo: VideoMessage = {
        id: videoId,
        videoUrl: "https://v3.fal.media/files/lion/SwXkHnSV2Wcnoh8aQ7tqD_output.mp4",
        prompt,
        timestamp: new Date(),
      };

      // Send to backend API
      const response = await fetch('http://localhost:8081/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add the video to videos list
      setVideos(prev => [...prev, newVideo]);
      setCurrentVideoId(videoId);

      // Add AI response with video link
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `${data.response}\n\nI've generated a video based on your prompt. You can view it in the video timeline.`,
        isUser: false,
        timestamp: new Date(),
        videoId: videoId,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling backend API:', error);
      
      // Still create a video even if backend fails
      const videoId = (Date.now() + 1000).toString();
      const newVideo: VideoMessage = {
        id: videoId,
        videoUrl: "https://v3.fal.media/files/lion/SwXkHnSV2Wcnoh8aQ7tqD_output.mp4",
        prompt,
        timestamp: new Date(),
      };

      setVideos(prev => [...prev, newVideo]);
      setCurrentVideoId(videoId);
      
      // Add error message with video link
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the server, but I've generated a video based on your prompt. You can view it in the video timeline.",
        isUser: false,
        timestamp: new Date(),
        videoId: videoId,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGeneration = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate video generation delay
    setTimeout(() => {
      const newVideo: VideoMessage = {
        id: Date.now().toString(),
        videoUrl: "https://v3.fal.media/files/lion/SwXkHnSV2Wcnoh8aQ7tqD_output.mp4",
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

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Project Menu - positioned absolutely in top left */}
        <div className="absolute top-4 left-4 z-50">
          <ProjectMenu onOpenSettings={handleOpenSettings} />
        </div>
        
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Chat Interface - Resizable Panel */}
          <ResizablePanel defaultSize={33} minSize={25} maxSize={50}>
            <ChatInterface 
              onSendMessage={handleSendMessage}
              onGenerateVideo={handleVideoGeneration}
              onVideoSelect={handleVideoSelect}
              isGenerating={isGenerating}
              videos={videos}
              messages={messages}
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
      
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Chat;
