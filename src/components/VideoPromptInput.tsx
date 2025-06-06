
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
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  return (
    <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-4 border border-slate-600">
      <div className="w-full">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-full resize-none p-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          style={{
            minHeight: '80px',
            height: '80px',
            maxHeight: '200px',
            overflow: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-slate-400">Public</span>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={!prompt.trim() || isDisabled}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 w-10 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoPromptInput;
