import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ChatInterface from "@/components/ChatInterface";
import VideoEditor from "@/components/VideoEditor";
import ProjectMenu from "@/components/ProjectMenu";
import SettingsDialog from "@/components/SettingsDialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useVideoStore from "@/stores/use-video-store";
import useLayoutStore from "@/features/editor/store/use-layout-store";
import useStore from "@/features/editor/store/use-store";
import { createProject, getProject, sendChatMessage, ProjectDetails, ChatMessage } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export interface VideoMessage {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  messageId?: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
  videoIds?: string[];
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId } = useParams();
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedVideoIds, setHighlightedVideoIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const { addChatVideo, scrollToVideos, clearHighlights, clearAllChatVideos } = useVideoStore();
  const { setActiveMenuItem, setShowMenuItem } = useLayoutStore();
  const { timeline, setState } = useStore();

  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Helper function to parse message content
  const parseMessageContent = (content: string): string => {
    if (!content) return '';
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      
      // Handle different JSON structures
      if (typeof parsed === 'string') {
        return parsed;
      }
      
      if (parsed.textResponse) {
        return parsed.textResponse;
      }
      
      if (parsed.text) {
        return parsed.text;
      }
      
      if (parsed.content) {
        return parsed.content;
      }
      
      if (parsed.message) {
        return parsed.message;
      }
      
      // Handle user input format
      if (parsed.user_input) {
        return parsed.user_input;
      }
      
      // If it's an object but doesn't have expected properties, stringify it nicely
      if (typeof parsed === 'object') {
        // Try to extract any text-like properties
        const textProps = ['text', 'message', 'content', 'textResponse', 'response', 'user_input'];
        for (const prop of textProps) {
          if (parsed[prop] && typeof parsed[prop] === 'string') {
            return parsed[prop];
          }
        }
        // If no text properties found, return the original content
        return content;
      }
      
      return content;
    } catch {
      // If it's not valid JSON, it might be user text with JSON appended
      // Look for patterns where user text is followed by JSON instructions
      const jsonInstructionPattern = /^(.+?)\s*You must answer strictly in the following JSON format:/s;
      const match = content.match(jsonInstructionPattern);
      
      if (match && match[1]) {
        // Return just the user text part, trimmed
        return match[1].trim();
      }
      
      // Also check for other JSON instruction patterns
      const jsonFormatPattern = /^(.+?)\s*\{\s*"textResponse":/s;
      const formatMatch = content.match(jsonFormatPattern);
      
      if (formatMatch && formatMatch[1]) {
        return formatMatch[1].trim();
      }
      
      // If no patterns match, return as is
      return content;
    }
  };

  // Helper function to extract video URLs from message content
  const extractVideoUrls = (content: string): string[] => {
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      
      // Check for various video URL properties
      if (parsed.clip_urls && Array.isArray(parsed.clip_urls)) {
        return parsed.clip_urls;
      }
      
      if (parsed.videoUrls && Array.isArray(parsed.videoUrls)) {
        return parsed.videoUrls;
      }
      
      if (parsed.videos && Array.isArray(parsed.videos)) {
        return parsed.videos;
      }
      
      return [];
    } catch {
      return [];
    }
  };

  // Load existing project if projectId is provided
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !isAuthenticated) return;
      
      setIsLoadingProject(true);
      
      // Clear existing videos when loading a new project
      clearAllChatVideos();
      
      try {
        const token = await getAccessTokenSilently();
        const projectDetails = await getProject(token, projectId);
        
        // Convert backend messages to frontend format with proper text parsing
        const convertedMessages: Message[] = [];
        const videoMessages: VideoMessage[] = [];
        
        for (const msg of projectDetails.messages) {
          const messageText = parseMessageContent(msg.text_content || '');
          const videoUrls = extractVideoUrls(msg.text_content || '');
          
          const convertedMessage: Message = {
            id: msg.id,
            text: messageText,
            isUser: msg.message_type === 'user',
            timestamp: new Date(msg.created_at),
          };
          
          // If this is an AI message with videos, process them
          if (!convertedMessage.isUser && videoUrls.length > 0) {
            const messageVideoIds: string[] = [];
            
            videoUrls.forEach((videoUrl, index) => {
              const videoId = `${msg.id}_video_${index}`;
              messageVideoIds.push(videoId);
              
              const videoMessage: VideoMessage = {
                id: videoId,
                videoUrl: videoUrl,
                prompt: `${messageText} (${index + 1}/${videoUrls.length})`,
                timestamp: new Date(msg.created_at),
                messageId: msg.id,
              };
              
              videoMessages.push(videoMessage);
              
              // Add to shared video store for editor
              const chatVideo = {
                id: videoId,
                videoUrl: videoUrl,
                prompt: `${messageText} (${index + 1}/${videoUrls.length})`,
                timestamp: new Date(msg.created_at),
                preview: videoUrl,
                messageId: msg.id,
              };
              
              addChatVideo(chatVideo);
            });
            
            convertedMessage.videoIds = messageVideoIds;
          }
          
          convertedMessages.push(convertedMessage);
        }
        
        setMessages(convertedMessages);
        setVideos(videoMessages);
        setCurrentProjectId(projectId);
        
        // If there are videos, set the videos panel as active
        if (videoMessages.length > 0) {
          setActiveMenuItem("videos");
          setShowMenuItem(true);
        }
        
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId, isAuthenticated, getAccessTokenSilently, addChatVideo, setActiveMenuItem, setShowMenuItem, clearAllChatVideos]);

  // Check for initial prompt from URL parameters
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && !currentProjectId) {
      // Clear the URL parameter
      setSearchParams(new URLSearchParams());
      // Create new project with initial prompt
      handleCreateProjectWithPrompt(initialPrompt);
    }
  }, [searchParams, currentProjectId]);

  const handleCreateProjectWithPrompt = async (prompt: string) => {
    if (!isAuthenticated) return;
    
    setIsGenerating(true);
    try {
      const token = await getAccessTokenSilently();
      const result = await createProject(token, prompt);
      
      setCurrentProjectId(result.project.id);
      
      // Add the initial user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: prompt,
        isUser: true,
        timestamp: new Date(),
      };
      
      // Add the AI response with proper text parsing
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: parseMessageContent(result.response.text || ''),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages([userMessage, aiMessage]);
      
      // Handle videos if provided
      if (result.response.clip_urls && result.response.clip_urls.length > 0) {
        handleVideoUrls(result.response.clip_urls, prompt, aiMessage.id);
      }
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim() || isGenerating || !isAuthenticated) return;

    // If no project exists, create one first
    if (!currentProjectId) {
      return handleCreateProjectWithPrompt(prompt);
    }

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
      const token = await getAccessTokenSilently();
      const response = await sendChatMessage(token, currentProjectId, prompt);
      
      const aiMessageId = (Date.now() + 1).toString();
      
      // Add AI response with proper text parsing
      const aiMessage: Message = {
        id: aiMessageId,
        text: parseMessageContent(response.text || ''),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Handle videos if provided
      if (response.clip_urls && response.clip_urls.length > 0) {
        handleVideoUrls(response.clip_urls, prompt, aiMessageId);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addVideoToTimeline = async (videoUrl: string, videoId: string, index: number = 0) => {
    if (!timeline) {
      console.log('Timeline not available, cannot add video');
      return;
    }

    try {
      // Calculate position based on index to avoid overlapping
      const videoDuration = 5000; // 5 seconds per video
      const startTime = index * videoDuration;
      const endTime = startTime + videoDuration;

      console.log('Adding video to timeline:', { videoId, videoUrl, startTime, endTime });
      
      // Set safe integer dimensions for OffscreenCanvas
      const safeWidth = 1080;
      const safeHeight = 1920;
      
      console.log('Using safe dimensions:', { safeWidth, safeHeight });
      
      // Create the track item with all required properties and safe dimensions
      const trackItem = {
        id: videoId,
        type: "video" as const,
        name: `Video ${index + 1}`,
        display: {
          from: startTime,
          to: endTime,
        },
        details: {
          src: videoUrl,
          volume: 100,
          opacity: 1,
        },
        trim: {
          from: 0,
          to: videoDuration,
        },
        trackId: "main",
        // Ensure all dimension properties are safe integers
        width: safeWidth,
        height: safeHeight,
        metadata: {
          resourceId: videoId,
          duration: videoDuration,
          width: safeWidth,
          height: safeHeight,
          previewUrl: videoUrl,
        },
        // Add additional dimension properties that the library might be looking for
        videoWidth: safeWidth,
        videoHeight: safeHeight,
        naturalWidth: safeWidth,
        naturalHeight: safeHeight,
      };

      console.log('Track item before adding:', JSON.stringify(trackItem, null, 2));

      // Use the timeline's addTrackItem method if available
      if (timeline.addTrackItem && typeof timeline.addTrackItem === 'function') {
        console.log('Using timeline.addTrackItem method');
        await timeline.addTrackItem(trackItem);
        console.log('Video added via timeline.addTrackItem');
      } else {
        // Fallback: manually update the state
        console.log('Using fallback method to add video');
        
        // Get current state from the store
        const currentState = useStore.getState();
        const currentTracks = currentState.tracks || [];
        
        // Find or create main track
        let mainTrack = currentTracks.find(track => track.id === "main");
        if (!mainTrack) {
          mainTrack = {
            id: "main",
            type: "video",
            items: []
          };
        }

        // Add the video item ID to the track (tracks only store IDs)
        const updatedTrack = {
          ...mainTrack,
          items: [...(mainTrack.items || []), videoId]
        };

        // Update tracks array
        const updatedTracks = currentTracks.filter(track => track.id !== "main");
        updatedTracks.push(updatedTrack);

        // Update the state with track items stored separately
        await setState({
          tracks: updatedTracks,
          trackItemsMap: {
            ...currentState.trackItemsMap,
            [trackItem.id]: trackItem
          },
          trackItemIds: [...(currentState.trackItemIds || []), trackItem.id]
        });
        
        console.log('Video added via fallback method');
      }
      
      console.log('Video successfully added to timeline');
      
    } catch (error) {
      console.error('Error adding video to timeline:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        videoId,
        videoUrl,
        index
      });
    }
  };

  const handleVideoUrls = (clipUrls: string[], prompt: string, messageId: string) => {
    let videoIds: string[] = [];
    
    clipUrls.forEach((videoUrl, index) => {
      const currentVideoId = (Date.now() + 1000 + index).toString();
      videoIds.push(currentVideoId);
      
      const newVideo: VideoMessage = {
        id: currentVideoId,
        videoUrl: videoUrl,
        prompt: `${prompt} (${index + 1}/${clipUrls.length})`,
        timestamp: new Date(),
        messageId: messageId,
      };

      // Add to local videos list
      setVideos(prev => [...prev, newVideo]);

      // Add to shared video store for editor
      const chatVideo = {
        id: currentVideoId,
        videoUrl: videoUrl,
        prompt: `${prompt} (${index + 1}/${clipUrls.length})`,
        timestamp: new Date(),
        preview: videoUrl,
        messageId: messageId,
      };
      
      addChatVideo(chatVideo);

      // Add video to timeline automatically with proper indexing
      addVideoToTimeline(videoUrl, currentVideoId, index);

      // Set the first video as current
      if (index === 0) {
        setCurrentVideoId(currentVideoId);
      }
    });

    // Update the message with video IDs
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, videoIds: videoIds }
        : msg
    ));

    // Switch to videos panel in editor
    setActiveMenuItem("videos");
    setShowMenuItem(true);
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
    if (!message.isUser && message.videoIds && message.videoIds.length > 0) {
      setActiveMenuItem("videos");
      setShowMenuItem(true);
      scrollToVideos(message.videoIds);
    } else if (message.videoId) {
      setActiveMenuItem("videos");
      setShowMenuItem(true);
      setCurrentVideoId(message.videoId);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  if (isLoading || isLoadingProject) {
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
