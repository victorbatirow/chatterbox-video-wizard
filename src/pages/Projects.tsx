
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";

const Projects = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar isAuthenticated={true} />
      <RecentProjectsSection />
    </div>
  );
};

export default Projects;
