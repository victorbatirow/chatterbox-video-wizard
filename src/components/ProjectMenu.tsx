import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowLeft, Settings, FileText, Palette, HelpCircle } from "lucide-react";
import RenameProjectDialog from "@/components/RenameProjectDialog";

interface ProjectMenuProps {
  onOpenSettings?: () => void;
  projectId?: string;
  projectName?: string;
  onProjectRenamed?: (newName: string) => void;
}

const ProjectMenu = ({ onOpenSettings, projectId, projectName = "video-generation-project", onProjectRenamed }: ProjectMenuProps) => {
  const navigate = useNavigate();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    window.scrollTo(0, 0);
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  const handleRenameClick = () => {
    setIsRenameDialogOpen(true);
  };

  const handleCloseRenameDialog = () => {
    setIsRenameDialogOpen(false);
  };

  const handleProjectRename = (newName: string) => {
    if (onProjectRenamed) {
      onProjectRenamed(newName);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 hover:text-white flex items-center gap-2"
          >
            <span className="text-sm">{projectName}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={handleGoToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRenameClick} disabled={!projectId}>
            <FileText className="w-4 h-4 mr-2" />
            Rename project
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {projectId && (
        <RenameProjectDialog
          isOpen={isRenameDialogOpen}
          onClose={handleCloseRenameDialog}
          projectId={projectId}
          currentProjectName={projectName}
          onRename={handleProjectRename}
        />
      )}
    </>
  );
};

export default ProjectMenu;
