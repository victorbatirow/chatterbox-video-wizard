import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ChatInterface from "@/components/ChatInterface";
import VideoTimeline from "@/components/VideoTimeline";
import ProjectMenu from "@/components/ProjectMenu";
import SettingsDialog from "@/components/SettingsDialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  createProject, 
  getProject, 
  sendChatMessage, 
  ensureUserExists,
  ProjectDetails, 
  ExternalMessage,
  GeneratedVideo,
  CreateProjectResponse,
  ChatPromptResponse
} from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useSettingsUrlManagement } from "@/hooks/useSettingsUrlManagement";

// Updated interfaces to match backend
export interface VideoMessage {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  messageId?: string;
  isClip?: boolean; // Distinguish between clips and final video
  clipIndex?: number; // For organizing clips
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoIds?: string[]; // For individual clips
  finalVideoId?: string; // For final merged video
  generatedVideo?: GeneratedVideo; // Store the full video structure
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId } = useParams();
  const [videos, setVideos] = useState<VideoMessage[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightedVideoIds, setHighlightedVideoIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("video-generation-project");
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();
  
  // Use the custom hook for settings URL management
  const { isSettingsOpen, handleOpenSettings, handleCloseSettings } = useSettingsUrlManagement();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Enhanced message content parsing for new backend format
  const parseMessageContent = (content: string): string => {
    if (!content) return '';
    
    try {
      const parsed = JSON.parse(content);
      
      // Handle the new backend response format
      if (typeof parsed === 'object' && parsed !== null) {
        // Check for direct text property first
        if (parsed.text && typeof parsed.text === 'string') {
          return parsed.text;
        }
        
        // Check for textResponse (legacy format)
        if (parsed.textResponse && typeof parsed.textResponse === 'string') {
          return parsed.textResponse;
        }
        
        // Handle user input format
        if (parsed.user_input && typeof parsed.user_input === 'string') {
          return parsed.user_input;
        }
        
        // Handle other common text fields
        const textFields = ['content', 'message', 'response'];
        for (const field of textFields) {
          if (parsed[field] && typeof parsed[field] === 'string') {
            return parsed[field];
          }
        }
      }
      
      // If it's a simple string, return it
      if (typeof parsed === 'string') {
        return parsed;
      }
      
      // Fallback to original content if no text found
      return content;
    } catch {
      // If not valid JSON, try to extract user text from mixed content
      const jsonInstructionPatterns = [
        /^(.+?)\s*You must answer strictly in the following JSON format:/s,
        /^(.+?)\s*\{\s*"textResponse":/s,
        /^(.+?)\s*\{\s*"text":/s,
      ];
      
      for (const pattern of jsonInstructionPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      // Return as is if no patterns match
      return content;
    }
  };

  // Enhanced video extraction for new backend format
  const extractGeneratedVideo = (content: string): GeneratedVideo | null => {
    if (!content) return null;
    
    try {
      const parsed = JSON.parse(content);
      
      // Check for the new structured video format
      if (parsed.generated_video) {
        const video = parsed.generated_video;
        if (video.clip_urls && Array.isArray(video.clip_urls) && video.full_video_url) {
          return {
            clip_urls: video.clip_urls,
            full_video_url: video.full_video_url,
          };
        }
      }
      
      // Check for direct video structure
      if (parsed.clip_urls && Array.isArray(parsed.clip_urls) && parsed.full_video_url) {
        return {
          clip_urls: parsed.clip_urls,
          full_video_url: parsed.full_video_url,
        };
      }
      
      // Legacy format - just clip URLs
      if (parsed.clip_urls && Array.isArray(parsed.clip_urls)) {
        return {
          clip_urls: parsed.clip_urls,
          full_video_url: '', // Empty for legacy
        };
      }
      
      // Other legacy formats
      const legacyFields = ['videoUrls', 'videos'];
      for (const field of legacyFields) {
        if (parsed[field] && Array.isArray(parsed[field])) {
          return {
            clip_urls: parsed[field],
            full_video_url: '',
          };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Convert backend messages to frontend format
  const convertBackendMessagesToFrontend = (backendMessages: ExternalMessage[]) => {
    const convertedMessages: Message[] = [];
    const videoMessages: VideoMessage[] = [];

    backendMessages.forEach((msg) => {
      const convertedMessage: Message = {
        id: msg.id,
        text: parseMessageContent(msg.text_content),
        isUser: msg.message_type === 'user',
        timestamp: new Date(msg.created_at),
      };

      // Handle AI messages with videos
      if (!convertedMessage.isUser && msg.video) {
        convertedMessage.generatedVideo = msg.video;
        
        // Create video messages for individual clips
        const clipVideoIds: string[] = [];
        msg.video.clip_urls.forEach((clipUrl, index) => {
          const clipVideoId = `${msg.id}_clip_${index}`;
          clipVideoIds.push(clipVideoId);
          
          const clipVideoMessage: VideoMessage = {
            id: clipVideoId,
            videoUrl: clipUrl,
            prompt: `${convertedMessage.text} - Clip ${index + 1}`,
            timestamp: new Date(msg.created_at),
            messageId: msg.id,
            isClip: true,
            clipIndex: index,
          };
          
          videoMessages.push(clipVideoMessage);
        });
        
        // Create video message for final video if available
        if (msg.video.full_video_url) {
          const finalVideoId = `${msg.id}_final`;
          const finalVideoMessage: VideoMessage = {
            id: finalVideoId,
            videoUrl: msg.video.full_video_url,
            prompt: `${convertedMessage.text} - Final Video`,
            timestamp: new Date(msg.created_at),
            messageId: msg.id,
            isClip: false,
          };
          
          videoMessages.push(finalVideoMessage);
          convertedMessage.finalVideoId = finalVideoId;
        }
        
        convertedMessage.videoIds = clipVideoIds;
      }

      convertedMessages.push(convertedMessage);
    });

    return { convertedMessages, videoMessages };
  };

  // Load existing project if projectId is provided
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !isAuthenticated) return;
      
      setIsLoadingProject(true);
      
      try {
        const token = await getAccessTokenSilently();
        const projectDetails = await getProject(token, projectId);

        // Set the project name from the backend response
      setCurrentProjectName(projectDetails.project.project_name)
        
        const { convertedMessages, videoMessages } = convertBackendMessagesToFrontend(projectDetails.messages);
        
        // If project has no messages, add a greeting message (created via "Create new project")
        if (convertedMessages.length === 0) {
          const greetingMessage: Message = {
            id: 'greeting',
            text: "Hi, I'm here to help you create amazing videos.\nWhat would you like to create today?",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages([greetingMessage]);
        } else {
          setMessages(convertedMessages);
        }
        
        setVideos(videoMessages);
        setCurrentProjectId(projectId);
        
        // Set the latest final video as current if available
        const latestFinalVideo = videoMessages
          .filter(v => !v.isClip)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        
        if (latestFinalVideo) {
          setCurrentVideoId(latestFinalVideo.id);
        } else if (videoMessages.length > 0) {
          // Fallback to latest video if no final video
          const latestVideo = videoMessages
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
          setCurrentVideoId(latestVideo.id);
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
  }, [projectId, isAuthenticated, getAccessTokenSilently]);

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

  // Create project with initial prompt
  const handleCreateProjectWithPrompt = async (prompt: string) => {
    if (!isAuthenticated) return;
    
    setIsGenerating(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Ensure user exists in backend
      if (user) {
        await ensureUserExists(token, user);
      }
      
      const result: CreateProjectResponse = await createProject(token, prompt);
      
      setCurrentProjectId(result.project.id);
      
      // Add the initial user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: prompt,
        isUser: true,
        timestamp: new Date(),
      };
      
      // Add the AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response.text,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages([userMessage, aiMessage]);
      
      // Handle generated video if available
      if (result.response.generated_video) {
        handleGeneratedVideo(result.response.generated_video, prompt, aiMessage.id);
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

  // Send message in existing project
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
      const response: ChatPromptResponse = await sendChatMessage(token, currentProjectId, prompt);
      
      const aiMessageId = (Date.now() + 1).toString();
      
      const aiMessage: Message = {
        id: aiMessageId,
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Handle generated video if available
      if (response.generated_video) {
        handleGeneratedVideo(response.generated_video, prompt, aiMessageId);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
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

  // Handle generated video structure from backend
  const handleGeneratedVideo = (generatedVideo: GeneratedVideo, prompt: string, messageId: string) => {
    const clipVideoIds: string[] = [];
    
    // Create video messages for individual clips
    generatedVideo.clip_urls.forEach((clipUrl, index) => {
      const clipVideoId = `${messageId}_clip_${index}`;
      clipVideoIds.push(clipVideoId);
      
      const clipVideoMessage: VideoMessage = {
        id: clipVideoId,
        videoUrl: clipUrl,
        prompt: `${prompt} - Clip ${index + 1}`,
        timestamp: new Date(),
        messageId: messageId,
        isClip: true,
        clipIndex: index,
      };

      setVideos(prev => [...prev, clipVideoMessage]);
    });

    // Create video message for final video if available
    let finalVideoId: string | undefined;
    if (generatedVideo.full_video_url) {
      finalVideoId = `${messageId}_final`;
      const finalVideoMessage: VideoMessage = {
        id: finalVideoId,
        videoUrl: generatedVideo.full_video_url,
        prompt: `${prompt} - Final Video`,
        timestamp: new Date(),
        messageId: messageId,
        isClip: false,
      };

      setVideos(prev => [...prev, finalVideoMessage]);
      
      // Set the final video as current
      setCurrentVideoId(finalVideoId);
    } else if (clipVideoIds.length > 0) {
      // If no final video, set the first clip as current
      setCurrentVideoId(clipVideoIds[0]);
    }

    // Update the message with video IDs and generated video data
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            videoIds: clipVideoIds,
            finalVideoId: finalVideoId,
            generatedVideo: generatedVideo
          }
        : msg
    ));
  };

  // Legacy video generation handler (kept for compatibility)
  const handleVideoGeneration = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate video generation delay
    setTimeout(() => {
      const newVideo: VideoMessage = {
        id: Date.now().toString(),
        videoUrl: "https://v3.fal.media/files/lion/SwXkHnSV2Wcnoh8aQ7tqD_output.mp4",
        prompt,
        timestamp: new Date(),
        isClip: false, // This is a legacy single video
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
      // For messages with multiple videos, select the final video if available, otherwise the first clip
      if (message.finalVideoId) {
        setCurrentVideoId(message.finalVideoId);
      } else {
        setCurrentVideoId(message.videoIds[0]);
      }
    } else if (message.videoIds && message.videoIds.length > 0) {
      setCurrentVideoId(message.videoIds[0]);
    }
  };

  const handleProjectRename = (newName: string) => {
    setCurrentProjectName(newName);
    // Optionally reload the project or update URL
    toast({
      title: "Project Renamed",
      description: `Project name updated to "${newName}"`,
    });
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
          <ProjectMenu 
            onOpenSettings={handleOpenSettings} 
            projectId={currentProjectId || undefined}
            projectName={currentProjectName}
            onProjectRenamed={handleProjectRename}
          />
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
        onClose={handleCloseSettings}
        disableOpenCloseUrlManagement={true}
        projectId={currentProjectId || undefined}
        projectName={currentProjectName}
        onProjectRenamed={handleProjectRename}
      />
    </>
  );
};

export default Chat;