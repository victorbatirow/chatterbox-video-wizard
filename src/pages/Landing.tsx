
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import LayeredBackground from "@/components/LayeredBackground";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = (prompt: string) => {
    // For now, just navigate to the main app
    window.location.href = "/app";
  };

  return (
    <LayeredBackground>
      <div className="flex flex-col min-h-full">
        {/* Navigation */}
        <Navbar isAuthenticated={false} />

        <div className="flex flex-col flex-1">
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
    </LayeredBackground>
  );
};

export default Landing;
