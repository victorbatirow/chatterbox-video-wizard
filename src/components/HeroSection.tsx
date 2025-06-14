
import VideoPromptInput from "@/components/VideoPromptInput";

interface HeroSectionProps {
  onSubmit: (prompt: string) => void;
}

const HeroSection = ({ onSubmit }: HeroSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Dream it, describe it,{" "}
        <span className="inline-flex items-center gap-2">
          watch it come alive
        </span>
      </h1>
      <p className="text-xl text-white/70 mb-12 max-w-2xl">
        Generate stunning videos by chatting with AI
      </p>

      {/* Prompt Input - Centered */}
      <div className="mb-12 flex justify-center w-full">
        <VideoPromptInput onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default HeroSection;
