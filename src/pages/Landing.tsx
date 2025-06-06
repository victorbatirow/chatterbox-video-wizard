
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import Navbar from "@/components/Navbar";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = (prompt: string) => {
    // For now, just navigate to the main app
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <HeroSection onSubmit={handleGetStarted} />

      {/* From the Community */}
      <CommunitySection />
    </div>
  );
};

export default Landing;
