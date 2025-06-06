
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";

const Projects = () => {
  return (
    <div className="min-h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar isAuthenticated={true} />
      <RecentProjectsSection />
      <Footer />
    </div>
  );
};

export default Projects;
