
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "@/components/Navbar";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";
import { createProject, getProjects, Project } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const Projects = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const userProjects = await getProjects(token);
          setProjects(userProjects);
        } catch (error) {
          console.error('Error loading projects:', error);
          toast({
            title: "Error",
            description: "Failed to load projects",
            variant: "destructive",
          });
        }
      }
    };

    loadProjects();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleCreateNewProject = async () => {
    if (!isAuthenticated) return;
    
    setIsCreatingProject(true);
    try {
      const token = await getAccessTokenSilently();
      const result = await createProject(token);
      
      // Navigate to the new project's chat
      navigate(`/chat/${result.project.id}`);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProject(false);
    }
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
    return null; // Will redirect to Auth0 login
  }

  return (
    <div className="flex flex-col min-h-full relative">
      <StaticGradientBackground />
      
      <Navbar isAuthenticated={true} />
      
      <div className="flex flex-col flex-1 relative z-10 pt-16">
        <Container>
          <RecentProjectsSection 
            projects={projects} 
            onCreateProject={handleCreateNewProject}
            isCreatingProject={isCreatingProject}
          />
        </Container>
      </div>
      
      <Footer />
    </div>
  );
};

export default Projects;
