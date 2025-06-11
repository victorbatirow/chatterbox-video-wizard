
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0();

  useEffect(() => {
    // Only redirect to login if we're sure the user is not authenticated
    // and Auth0 has finished loading
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Log any Auth0 errors
  useEffect(() => {
    if (error) {
      console.error('Auth0 error in Dashboard:', error);
    }
  }, [error]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleCreateVideoFromPrompt = (prompt: string) => {
    // Navigate to chat with the prompt as a URL parameter
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full relative">
        <StaticGradientBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show a brief loading state before Auth0 redirect
    return (
      <div className="flex flex-col min-h-full relative">
        <StaticGradientBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Redirecting to login...</div>
        </div>
      </div>
    );
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
