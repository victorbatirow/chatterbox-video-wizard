
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ChatInterface from "@/components/ChatInterface";
import VideoEditor from "@/components/VideoEditor";
import ProjectMenu from "@/components/ProjectMenu";
import SettingsDialog from "@/components/SettingsDialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useVideoStore from "@/stores/use-video-store";
import useLayoutStore from "@/features/editor/store/use-layout-store";

export interface VideoMessage {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  messageId?: string; // Add messageId to track which message generated this video
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
  videoIds?: string[]; // Add array to track multiple videos per message
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedVideoIds, setHighlightedVideoIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const { addChatVideo } = useVideoStore();
  const { setActiveMenuItem, setShowMenuItem } = useLayoutStore();

  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

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
      console.log('Backend response data:', data);

      let videoIds: string[] = [];
      const aiMessageId = (Date.now() + 2).toString();

      // Check if backend returned video URLs (new format with clip_urls array)
      if (data.clip_urls && Array.isArray(data.clip_urls) && data.clip_urls.length > 0) {
        console.log('Processing clip_urls:', data.clip_urls);
        
        // Process each video URL in the array
        data.clip_urls.forEach((videoUrl: string, index: number) => {
          const currentVideoId = (Date.now() + 1000 + index).toString();
          videoIds.push(currentVideoId);
          
          const newVideo: VideoMessage = {
            id: currentVideoId,
            videoUrl: videoUrl,
            prompt: `${prompt} (${index + 1}/${data.clip_urls.length})`,
            timestamp: new Date(),
            messageId: aiMessageId, // Link video to the AI message
          };

          console.log('Adding video to local state:', newVideo);
          // Add to local videos list
          setVideos(prev => {
            const updated = [...prev, newVideo];
            console.log('Updated videos state:', updated);
            return updated;
          });

          // Add to shared video store for editor
          const chatVideo = {
            id: currentVideoId,
            videoUrl: videoUrl,
            prompt: `${prompt} (${index + 1}/${data.clip_urls.length})`,
            timestamp: new Date(),
            preview: videoUrl // Use video URL as preview for now
          };
          
          console.log('Adding video to store:', chatVideo);
          addChatVideo(chatVideo);

          // Set the first video as current
          if (index === 0) {
            setCurrentVideoId(currentVideoId);
            console.log('Set current video ID:', currentVideoId);
          }
        });

        // Switch to videos panel in editor
        console.log('Switching to videos panel');
        setActiveMenuItem("videos");
        setShowMenuItem(true);
      } else {
        console.log('No clip_urls found in response or empty array');
      }

      // Add AI response (use 'text' field from new format, fallback to 'response' for backward compatibility)
      const aiMessage: Message = {
        id: aiMessageId,
        text: data.text || data.response || "I've processed your request.",
        isUser: false,
        timestamp: new Date(),
        videoIds: videoIds.length > 0 ? videoIds : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling backend API:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again.",
        isUser: false,
        timestamp: new Date(),
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

  const handleMessageClick = (message: Message) => {
    console.log('Chat: handleMessageClick called with message:', message.id, message.videoIds);
    
    // Only handle clicks on AI messages that have videos
    if (!message.isUser && message.videoIds && message.videoIds.length > 0) {
      console.log('Chat: Message clicked, highlighting videos:', message.videoIds);
      
      // Switch to videos panel if not already active
      setActiveMenuItem("videos");
      setShowMenuItem(true);
      
      // Use the scrollToVideos function from the store to handle highlighting and scrolling
      const { scrollToVideos } = useVideoStore.getState();
      scrollToVideos(message.videoIds);
      
      // Also set local state for highlighting
      setHighlightedVideoIds(message.videoIds);
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedVideoIds([]);
      }, 3000);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to Auth0 login
  }

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
              onMessageClick={handleMessageClick}
              isGenerating={isGenerating}
              videos={videos}
              messages={messages}
              highlightedVideoIds={highlightedVideoIds}
            />
          </ResizablePanel>
          
          {/* Draggable Handle */}
          <ResizableHandle withHandle />
          
          {/* Video Timeline - Resizable Panel */}
          <ResizablePanel defaultSize={67} minSize={50}>
            <VideoEditor />
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
