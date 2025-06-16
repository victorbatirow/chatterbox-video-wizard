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

interface PendingRequest {
  projectId: string;
  prompt: string;
  userMessageId: string;
  timestamp: number;
  type: 'create' | 'message';
}

const PENDING_REQUEST_KEY = 'pending_chat_request';
const REQUEST_TIMEOUT = 5 * 60 * 1000; // 5 minutes

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
  const [hasLoadedProject, setHasLoadedProject] = useState(false);

  const { addChatVideo, scrollToVideos, clearHighlights, clearAllChatVideos } = useVideoStore();
  const { setActiveMenuItem, setShowMenuItem } = useLayoutStore();

  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Reset states when project changes or component unmounts
  useEffect(() => {
    return () => {
      // Clear generating state when component unmounts
      setIsGenerating(false);
    };
  }, []);

  // Reset states when projectId changes
  useEffect(() => {
    if (projectId !== currentProjectId) {
      console.log('Project changed, resetting states');
      setIsGenerating(false);
      setVideos([]);
      setMessages([]);
      setCurrentVideoId(null);
      setHighlightedVideoIds([]);
      setHasLoadedProject(false);
      clearAllChatVideos();
    }
  }, [projectId, currentProjectId, clearAllChatVideos]);

  const storePendingRequest = (pendingRequest: PendingRequest) => {
    localStorage.setItem(PENDING_REQUEST_KEY, JSON.stringify(pendingRequest));
  };

  const clearPendingRequest = () => {
    localStorage.removeItem(PENDING_REQUEST_KEY);
  };

  const retryCreateProject = async (pendingRequest: PendingRequest) => {
    try {
      const token = await getAccessTokenSilently();
      const result = await createProject(token, pendingRequest.prompt);
      
      clearPendingRequest();
      setCurrentProjectId(result.project.id);
      
      // Add the AI response with proper text parsing
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: parseMessageContent(result.response.text),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Handle videos if provided
      if (result.response.clip_urls && result.response.clip_urls.length > 0) {
        handleVideoUrls(result.response.clip_urls, pendingRequest.prompt, aiMessage.id);
      }
    } catch (error) {
      console.error('Error retrying create project:', error);
      throw error;
    }
  };

  const retryMessage = async (pendingRequest: PendingRequest) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await sendChatMessage(token, pendingRequest.projectId, pendingRequest.prompt);
      
      clearPendingRequest();
      
      const aiMessageId = (Date.now() + 1).toString();
      
      // Add AI response with proper text parsing
      const aiMessage: Message = {
        id: aiMessageId,
        text: parseMessageContent(response.text),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Handle videos if provided
      if (response.clip_urls && response.clip_urls.length > 0) {
        handleVideoUrls(response.clip_urls, pendingRequest.prompt, aiMessageId);
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      throw error;
    }
  };

  // Check for pending requests on mount
  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!isAuthenticated) return;

      const pendingRequestStr = localStorage.getItem(PENDING_REQUEST_KEY);
      if (!pendingRequestStr) return;

      try {
        const pendingRequest: PendingRequest = JSON.parse(pendingRequestStr);
        
        // Check if request is too old
        if (Date.now() - pendingRequest.timestamp > REQUEST_TIMEOUT) {
          localStorage.removeItem(PENDING_REQUEST_KEY);
          return;
        }

        // Only process pending request if it's for the current project or no project is set
        if (pendingRequest.projectId && pendingRequest.projectId !== projectId) {
          console.log('Pending request is for different project, ignoring');
          return;
        }

        console.log('Found pending request, attempting recovery:', pendingRequest);
        
        // Set generating state
        setIsGenerating(true);
        
        // If we have a project ID and it doesn't match current, load the project
        if (pendingRequest.projectId && pendingRequest.projectId !== currentProjectId) {
          setCurrentProjectId(pendingRequest.projectId);
        }

        // Retry the request
        if (pendingRequest.type === 'create') {
          await retryCreateProject(pendingRequest);
        } else {
          await retryMessage(pendingRequest);
        }
        
      } catch (error) {
        console.error('Error recovering pending request:', error);
        localStorage.removeItem(PENDING_REQUEST_KEY);
        setIsGenerating(false);
        
        toast({
          title: "Request Recovery Failed",
          description: "Your previous request couldn't be completed. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (isAuthenticated) {
      checkPendingRequest();
    }
  }, [isAuthenticated, projectId]);

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
      if (!projectId || !isAuthenticated || hasLoadedProject) return;
      
      setIsLoadingProject(true);
      
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
        
        console.log('Loaded project with videos:', videoMessages.length);
        setMessages(convertedMessages);
        setVideos(videoMessages);
        setCurrentProjectId(projectId);
        setHasLoadedProject(true);
        
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
  }, [projectId, isAuthenticated, getAccessTokenSilently, addChatVideo, setActiveMenuItem, setShowMenuItem, hasLoadedProject]);

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
    
    const userMessageId = Date.now().toString();
    
    // Add the initial user message immediately
    const userMessage: Message = {
      id: userMessageId,
      text: prompt,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages([userMessage]);
    setIsGenerating(true);
    
    // Store pending request
    const pendingRequest: PendingRequest = {
      projectId: '',
      prompt,
      userMessageId,
      timestamp: Date.now(),
      type: 'create'
    };
    storePendingRequest(pendingRequest);
    
    try {
      const token = await getAccessTokenSilently();
      const result = await createProject(token, prompt);
      
      clearPendingRequest();
      setCurrentProjectId(result.project.id);
      
      // Add the AI response with proper text parsing
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: parseMessageContent(result.response.text),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Handle videos if provided
      if (result.response.clip_urls && result.response.clip_urls.length > 0) {
        handleVideoUrls(result.response.clip_urls, prompt, aiMessage.id);
      }
      
    } catch (error) {
      console.error('Error creating project:', error);
      // Don't clear pending request on error - let recovery handle it
      toast({
        title: "Error",
        description: "Failed to create project. The request will be retried if you refresh the page.",
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

    const userMessageId = Date.now().toString();
    
    // Add user message
    const userMessage: Message = {
      id: userMessageId,
      text: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    // Store pending request
    const pendingRequest: PendingRequest = {
      projectId: currentProjectId,
      prompt,
      userMessageId,
      timestamp: Date.now(),
      type: 'message'
    };
    storePendingRequest(pendingRequest);

    try {
      const token = await getAccessTokenSilently();
      const response = await sendChatMessage(token, currentProjectId, prompt);
      
      clearPendingRequest();
      
      const aiMessageId = (Date.now() + 1).toString();
      
      // Add AI response with proper text parsing
      const aiMessage: Message = {
        id: aiMessageId,
        text: parseMessageContent(response.text),
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
      // Don't clear pending request on error - let recovery handle it
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Your request will be retried if you refresh the page.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. The request will be retried if you refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
        preview: videoUrl
      };
      
      addChatVideo(chatVideo);

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
