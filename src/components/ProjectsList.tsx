
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Video, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/services/api";

interface ProjectsListProps {
  projects: Project[];
  onCreateProject: () => void;
  isCreatingProject: boolean;
}

const ProjectsList = ({ 
  projects, 
  onCreateProject,
  isCreatingProject 
}: ProjectsListProps) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/chat/${projectId}`);
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
    <section className="py-12">
      <div className="px-6 py-8 bg-black/50 backdrop-blur-sm rounded-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">All Projects</h2>
          <Button 
            onClick={onCreateProject}
            disabled={isCreatingProject}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingProject ? 'Creating...' : 'New Project'}
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-white/60 mb-6">Create your first video project to get started</p>
            <Button 
              onClick={onCreateProject}
              disabled={isCreatingProject}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreatingProject ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
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
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsList;
