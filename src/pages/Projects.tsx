
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";

const Projects = () => {
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
