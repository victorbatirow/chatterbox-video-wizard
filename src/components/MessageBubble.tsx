
import { Play } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  videoId?: string;
  videoIds?: string[]; // Add array to track multiple videos per message
}

interface MessageBubbleProps {
  message: Message;
  onClick?: () => void;
  hasVideo?: boolean;
}

const MessageBubble = ({ message, onClick, hasVideo }: MessageBubbleProps) => {
  const handleClick = () => {
    console.log('MessageBubble clicked:', message.id, 'hasVideo:', hasVideo, 'videoIds:', message.videoIds);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[80%] ${
          message.isUser 
            ? "bg-white text-gray-900 border border-gray-200" 
            : "bg-white/10 text-white"
        } rounded-2xl px-4 py-3 ${
          hasVideo ? "cursor-pointer hover:bg-white/20 transition-colors" : ""
        }`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-2">
          {hasVideo && (
            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
              <Play className="w-3 h-3 text-white" />
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className={`text-xs mt-1 ${
          message.isUser ? "text-gray-500" : "text-white/50"
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
