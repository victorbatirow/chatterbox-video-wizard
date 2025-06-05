
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import ProjectMenu from "@/components/ProjectMenu";

interface ChatInterfaceProps {
  onGenerateVideo: (prompt: string) => void;
  isGenerating: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface = ({ onGenerateVideo, isGenerating }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI video generator. Describe the video you'd like me to create - be as detailed as possible!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const promptSuggestions = [
    "A serene sunset over mountains with birds flying",
    "A futuristic city with flying cars at night",
    "Ocean waves crashing on a beach in slow motion",
    "A cozy coffee shop on a rainy day",
  ];

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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <ProjectMenu />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VideoAI Studio</h1>
            <p className="text-sm text-white/60">AI-powered video generation</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
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
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe the video you want to create..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isGenerating}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
