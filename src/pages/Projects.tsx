
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import LayeredBackground from "@/components/LayeredBackground";

const Projects = () => {
  return (
    <LayeredBackground>
      <div className="flex flex-col min-h-full">
        <Navbar isAuthenticated={true} />
        
        <div className="flex flex-col flex-1">
          <Container>
            <RecentProjectsSection />
          </Container>
        </div>
        
        <Footer />
      </div>
    </LayeredBackground>
  );
};

export default Projects;
