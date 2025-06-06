
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import VideoPromptInput from "@/components/VideoPromptInput";
import CommunitySection from "@/components/CommunitySection";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = (prompt: string) => {
    // For now, just navigate to the main app
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Video className="w-10 h-10 text-purple-400" />
            <span className="text-2xl font-bold text-white">Pamba</span>
          </div>
          <div className="flex items-center gap-6 text-white/80">
            <a href="#" className="hover:text-white transition-colors">Community</a>
            <a href="#" className="hover:text-white transition-colors">Gallery</a>
            <a href="#" className="hover:text-white transition-colors">Learn</a>
            <a href="#" className="hover:text-white transition-colors">Showcase</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white text-purple-900 hover:bg-white/90">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
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
          <VideoPromptInput onSubmit={handleGetStarted} />
        </div>
      </div>

      {/* From the Community */}
      <CommunitySection />
    </div>
  );
};

export default Landing;
