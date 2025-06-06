
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCreateVideoFromPrompt = (prompt: string) => {
    // Navigate to app with the prompt (in a real app, you'd pass this as state or URL param)
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <Navbar isAuthenticated={true} />

      {/* Hero Section with Video Creation Prompt */}
      <HeroSection onSubmit={handleCreateVideoFromPrompt} />

      {/* Recent Projects */}
      <RecentProjectsSection />

      {/* From the Community */}
      <CommunitySection />
    </div>
  );
};

export default Dashboard;
