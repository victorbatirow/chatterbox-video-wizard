import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Projects = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

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
    return null; // Will redirect to Auth0 login
  }

  return (
    <div className="flex flex-col min-h-full relative">
      <StaticGradientBackground />
      
      <Navbar isAuthenticated={true} />
      
      <div className="flex flex-col flex-1 relative z-10">
        <Container>
          <RecentProjectsSection />
        </Container>
      </div>
      
      <Footer />
    </div>
  );
};

export default Projects;
