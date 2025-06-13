
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import { VideoMessage, Message } from "@/pages/Chat";

interface ChatInterfaceProps {
  onSendMessage: (prompt: string) => void;
  onGenerateVideo: (prompt: string) => void;
  onVideoSelect: (videoId: string) => void;
  isGenerating: boolean;
  videos: VideoMessage[];
  messages: Message[];
}

const ChatInterface = ({ onSendMessage, onGenerateVideo, onVideoSelect, isGenerating, videos, messages }: ChatInterfaceProps) => {
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
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleMessageClick = (message: Message) => {
    if (message.videoId) {
      onVideoSelect(message.videoId);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header - spacing for the absolutely positioned ProjectMenu */}
      <div className="h-16 flex-shrink-0"></div>

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
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="p-6">
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
      <div className="p-6">
        <div className="w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="w-full">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
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
          <div className="flex justify-end items-center mt-3">
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
      </div>
    </div>
  );
};

export default ChatInterface;
