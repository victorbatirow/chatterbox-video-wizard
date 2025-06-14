
import { useState } from "react";
import VideoPromptInput from "@/components/VideoPromptInput";

interface HeroSectionProps {
  onSubmit: (prompt: string) => void;
  isDisabled?: boolean;
}

const HeroSection = ({ onSubmit, isDisabled = false }: HeroSectionProps) => {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Create stunning videos with{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI magic
          </span>
        </h1>
        
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your ideas into professional videos in seconds. No editing skills required.
        </p>
        
        {/* Video Prompt Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <VideoPromptInput 
            onSubmit={onSubmit}
            placeholder="Describe the video you want to create..."
            isDisabled={isDisabled}
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            AI-powered generation
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Professional quality
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Export ready
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
