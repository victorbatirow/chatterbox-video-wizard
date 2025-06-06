
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
    // Navigate to app with the prompt (in a real app, you'd pass this as state or URL param)
    navigate('/app');
  };

  return (
    <div className="flex flex-col min-h-full">
      <StaticGradientBackground />
      
      {/* Navigation */}
      <Navbar isAuthenticated={true} />

      <div className="flex flex-col flex-1">
        <Container>
          {/* Hero Section with Video Creation Prompt */}
          <HeroSection onSubmit={handleCreateVideoFromPrompt} />

          {/* Recent Projects */}
          <RecentProjectsSection />

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
