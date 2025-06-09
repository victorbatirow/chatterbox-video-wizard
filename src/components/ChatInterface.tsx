
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import ProjectMenu from "@/components/ProjectMenu";
import { VideoMessage } from "@/pages/Chat";

interface ChatInterfaceProps {
  onGenerateVideo: (prompt: string) => void;
  onVideoSelect: (videoId: string) => void;
  isGenerating: boolean;
  videos: VideoMessage[];
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
}

const ChatInterface = ({ onGenerateVideo, onVideoSelect, isGenerating, videos }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI video generator. Describe the video you'd like me to create - be as detailed as possible!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    "A serene sunset over mountains with birds flying",
    "A futuristic city with flying cars at night",
    "Ocean waves crashing on a beach in slow motion",
    "A cozy coffee shop on a rainy day",
  ];

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Scroll to bottom when messages change or when generating
  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    onGenerateVideo(inputValue);

    // Add AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Great! I'm generating your video now. This might take a few moments...",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update messages when a new video is generated
  useEffect(() => {
    if (videos.length > 0) {
      const latestVideo = videos[videos.length - 1];
      const videoMessage: Message = {
        id: `video-${latestVideo.id}`,
        text: `Here's your generated video: "${latestVideo.prompt}"`,
        isUser: false,
        timestamp: latestVideo.timestamp,
        videoId: latestVideo.id,
      };

      setMessages(prev => {
        // Replace the "generating" message with the video message
        const updatedMessages = [...prev];
        // Find the last AI message that doesn't have a video
        let lastAiMessageIndex = -1;
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (!updatedMessages[i].isUser && !updatedMessages[i].videoId) {
            lastAiMessageIndex = i;
            break;
          }
        }
        
        if (lastAiMessageIndex !== -1) {
          updatedMessages[lastAiMessageIndex] = videoMessage;
        } else {
          updatedMessages.push(videoMessage);
        }
        return updatedMessages;
      });
    }
  }, [videos]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleMessageClick = (message: Message) => {
    if (message.videoId) {
      onVideoSelect(message.videoId);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <ProjectMenu />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onClick={() => handleMessageClick(message)}
              hasVideo={!!message.videoId}
            />
          ))}
          
          {isGenerating && (
            <div className="flex items-center gap-2 text-white/60">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm">Generating video...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="p-6 border-t border-white/10">
          <p className="text-sm text-white/60 mb-3">Try these prompts:</p>
          <div className="grid grid-cols-1 gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="w-full">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the video you want to create..."
              disabled={isGenerating}
              className="bg-transparent border-none text-white placeholder:text-white/40 w-full resize-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              style={{
                minHeight: '24px',
                height: inputValue ? 'auto' : '24px',
                maxHeight: '200px',
                overflow: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.3) transparent'
              }}
            />
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/60">Public</span>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGenerating}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 w-10 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatInterface;
