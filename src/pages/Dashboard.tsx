
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCreateVideoFromPrompt = (prompt: string) => {
    // Navigate to chat with the prompt as a URL parameter
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
