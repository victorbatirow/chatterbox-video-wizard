
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${
        message.isUser 
          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
          : "bg-white/10 text-white"
      } rounded-2xl px-4 py-3`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
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
