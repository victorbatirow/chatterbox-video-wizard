
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
}

const Chat = () => {
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI video generator. Describe the video you'd like me to create - be as detailed as possible!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isGenerating) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Call backend API
      const response = await fetch('http://localhost:8080/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling backend API:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
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
            onSendMessage={handleSendMessage}
            onVideoSelect={handleVideoSelect}
            isGenerating={isGenerating}
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
  );
};

export default Chat;
