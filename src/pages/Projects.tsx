
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

const Projects = () => {
  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar isAuthenticated={true} />
      
      <div className="flex flex-col flex-1">
        <Container>
          <RecentProjectsSection />
        </Container>
      </div>
      
      <Footer />
    </div>
  );
};

export default Projects;
