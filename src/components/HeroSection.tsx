
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Create stunning videos with{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI magic
          </span>
        </h1>
        
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your ideas into professional videos in seconds. No editing skills required.
        </p>
        
        {/* Video Prompt Input */}
        <div className="max-w-2xl mx-auto">
          <VideoPromptInput 
            onSubmit={onSubmit}
            placeholder="Describe the video you want to create..."
            isDisabled={isDisabled}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
