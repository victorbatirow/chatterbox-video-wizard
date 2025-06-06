
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";

interface VideoPromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const VideoPromptInput = ({ 
  onSubmit, 
  placeholder = "Describe the video you want to create...",
  isDisabled = false 
}: VideoPromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (prompt.trim() && !isDisabled) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on content, with min and max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  return (
    <div className="w-full max-w-2xl bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30">
      <div className="flex gap-3 items-end">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          className="bg-transparent border-none text-white placeholder:text-slate-400 flex-1 resize-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30 hover:scrollbar-thumb-white/50"
          style={{
            minHeight: '80px',
            height: '80px',
            maxHeight: '200px',
            overflow: 'auto'
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!prompt.trim() || isDisabled}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 w-10 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-600/20">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-slate-400">Public</span>
      </div>
    </div>
  );
};

export default VideoPromptInput;
