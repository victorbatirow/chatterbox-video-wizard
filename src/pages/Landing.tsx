
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = (prompt: string) => {
    // Navigate to the chat page
    window.location.href = "/chat";
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <StaticGradientBackground />
      
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      <div className="flex flex-col flex-1 relative z-10">
        <Container>
          {/* Hero Section */}
          <HeroSection onSubmit={handleGetStarted} />

          {/* From the Community */}
          <CommunitySection />
        </Container>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
