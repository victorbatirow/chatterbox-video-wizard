import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import HeroSection from "@/components/HeroSection";
import CommunitySection from "@/components/CommunitySection";
import RecentProjectsSection from "@/components/RecentProjectsSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import StaticGradientBackground from "@/components/StaticGradientBackground";
import SettingsDialog from "@/components/SettingsDialog";
import { useSettingsUrlManagement } from "@/hooks/useSettingsUrlManagement";
import { 
  createProject, 
  getProjects, 
  Project
} from "@/services/api";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Use the custom hook for settings URL management
  const { isSettingsOpen, handleOpenSettings, handleCloseSettings } = useSettingsUrlManagement();

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
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('HTML')) {
            toast({
              title: "Backend Connection Error",
              description: "Cannot connect to the backend server. Please make sure it's running on http://localhost:8080",
              variant: "destructive",
            });
          } else if (errorMessage.includes('404')) {
            toast({
              title: "Backend Setup Issue",
              description: "API endpoints are missing. Please check your backend configuration.",
              variant: "destructive",
            });
          } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            toast({
              title: "Authentication Error", 
              description: "Your session may have expired. Please try logging out and back in.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to load projects. Please check if the backend is running.",
              variant: "destructive",
            });
          }
        }
      }
    };

    loadProjects();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleCreateVideoFromPrompt = async (prompt: string) => {
    if (!isAuthenticated) return;
    
    setIsCreatingProject(true);
    try {
      const token = await getAccessTokenSilently();
      const result = await createProject(token, prompt);
      
      // Navigate to the new project's chat
      navigate(`/chat/${result.project.id}`);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error creating project:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('HTML')) {
        toast({
          title: "Backend Connection Error",
          description: "Cannot connect to the backend server. Please make sure it's running on http://localhost:8080",
          variant: "destructive",
        });
      } else if (errorMessage.includes('404')) {
        toast({
          title: "Backend Setup Issue",
          description: "The project creation endpoint is missing. Please check your backend configuration.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('401')) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please try logging out and back in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingProject(false);
    }
  };

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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('HTML')) {
        toast({
          title: "Backend Connection Error",
          description: "Cannot connect to the backend server. Please make sure it's running on http://localhost:8080",
          variant: "destructive",
        });
      } else if (errorMessage.includes('404')) {
        toast({
          title: "Backend Setup Issue",
          description: "The project creation endpoint is missing. Please check your backend configuration.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('401')) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please try logging out and back in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
      }
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
      
      {/* Navigation */}
      <Navbar isAuthenticated={true} onOpenSettings={handleOpenSettings} />

      <div className="flex flex-col flex-1 relative z-10">
        <Container>
          {/* Hero Section with Video Creation Prompt */}
          <HeroSection onSubmit={handleCreateVideoFromPrompt} isDisabled={isCreatingProject} />

          {/* Recent Projects with integrated Create New Project button */}
          <RecentProjectsSection 
            projects={projects} 
            onCreateProject={handleCreateNewProject}
            isCreatingProject={isCreatingProject}
          />

          {/* Spacing between sections */}
          <div className="py-4" />

          {/* From the Community */}
          <CommunitySection />
        </Container>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={handleCloseSettings}
        disableOpenCloseUrlManagement={true}
      />
    </div>
  );
};

export default Dashboard;