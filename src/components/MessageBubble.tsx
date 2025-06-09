
import { Play } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
}

interface MessageBubbleProps {
  message: Message;
  onClick?: () => void;
  hasVideo?: boolean;
}

const MessageBubble = ({ message, onClick, hasVideo }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[80%] ${
          message.isUser 
            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
            : "bg-white/10 text-white"
        } rounded-2xl px-4 py-3 ${
          hasVideo ? "cursor-pointer hover:bg-white/20 transition-colors" : ""
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          {hasVideo && (
            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-white" />
            </div>
          )}
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <p className={`text-xs mt-1 ${
          message.isUser ? "text-white/70" : "text-white/50"
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
