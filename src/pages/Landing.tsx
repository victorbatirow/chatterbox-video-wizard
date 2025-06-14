
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";
import AuthDialog from "@/components/AuthDialog";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleGetStarted = (prompt: string) => {
    if (isAuthenticated) {
      // Navigate to the chat page with the prompt as a URL parameter
      navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
      window.scrollTo(0, 0);
    } else {
      // Show auth dialog instead of redirecting
      setIsAuthDialogOpen(true);
    }
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

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

      {/* Auth Dialog */}
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </div>
  );
};

export default Landing;
