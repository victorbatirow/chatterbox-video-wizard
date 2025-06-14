
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Video, ChevronRight, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Project } from "@/services/api";

interface RecentProjectsSectionProps {
  projects?: Project[];
  onCreateProject?: () => void;
  isCreatingProject?: boolean;
}

const RecentProjectsSection = ({ 
  projects = [], 
  onCreateProject,
  isCreatingProject = false 
}: RecentProjectsSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProjectsPage = location.pathname === '/projects';

  const handleProjectClick = (projectId: string) => {
    navigate(`/chat/${projectId}`);
    window.scrollTo(0, 0);
  };

  const handleViewAll = () => {
    navigate('/projects');
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
      <div className="px-6 py-8 bg-black/50 backdrop-blur-sm rounded-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            {isProjectsPage ? 'All Projects' : 'Recent Projects'}
          </h2>
          {!isProjectsPage && (
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 hover:text-white flex items-center gap-2"
              onClick={handleViewAll}
            >
              View All
            </Button>
          )}
        </div>
        
        {projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Project Card */}
            <Card 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group border-dashed"
              onClick={onCreateProject}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[160px]">
                <div className="bg-purple-600/20 p-3 rounded-lg mb-4">
                  <Plus className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors text-center">
                  {isCreatingProject ? 'Creating...' : 'Create New Project'}
                </h3>
                <p className="text-white/60 text-sm text-center">
                  Start a new video project
                </p>
              </CardContent>
            </Card>
            
            {/* Empty State for when there are no projects */}
            <div className="col-span-full text-center py-12">
              <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-white/60">Create your first video project to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isProjectsPage ? projects : projects.slice(0, 5)).map((project) => (
              <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                <CardContent 
                  className="p-6"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <Video className="w-6 h-6 text-purple-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    Video Project
                  </h3>
                  
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Project Card */}
            <Card 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group border-dashed"
              onClick={onCreateProject}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[160px]">
                <div className="bg-purple-600/20 p-3 rounded-lg mb-4">
                  <Plus className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors text-center">
                  {isCreatingProject ? 'Creating...' : 'Create New Project'}
                </h3>
                <p className="text-white/60 text-sm text-center">
                  Start a new video project
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
};

export default RecentProjectsSection;
