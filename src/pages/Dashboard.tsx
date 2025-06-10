
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCreateVideoFromPrompt = (prompt: string) => {
    // Navigate to chat with the prompt as a URL parameter
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <StaticGradientBackground />
      
      {/* Navigation */}
      <Navbar isAuthenticated={true} />

      <div className="flex flex-col flex-1 relative z-10">
        <Container>
          {/* Hero Section with Video Creation Prompt */}
          <HeroSection onSubmit={handleCreateVideoFromPrompt} />

          {/* Recent Projects */}
          <RecentProjectsSection />

          {/* Spacing between sections */}
          <div className="py-4" />

          {/* From the Community */}
          <CommunitySection />
        </Container>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
