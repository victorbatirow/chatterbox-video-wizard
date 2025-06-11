
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Community = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-full relative">
      <StaticGradientBackground />
      
      <Navbar isAuthenticated={true} />
      
      <div className="flex flex-col flex-1 relative z-10 pt-16">
        <Container>
          <CommunitySection />
        </Container>
      </div>
      
      <Footer />
    </div>
  );
};

export default Community;
