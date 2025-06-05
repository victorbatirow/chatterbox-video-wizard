
import { useState } from "react";
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

  return (
    <div className="w-full max-w-2xl bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex gap-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          disabled={isDisabled}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1 resize-none min-h-[60px] max-h-[240px] overflow-y-auto focus:bg-white/15 transition-colors"
          style={{
            height: Math.min(240, Math.max(60, prompt.split('\n').length * 24 + 36))
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!prompt.trim() || isDisabled}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 self-start shadow-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-white/60">Public</span>
      </div>
    </div>
  );
};

export default VideoPromptInput;
