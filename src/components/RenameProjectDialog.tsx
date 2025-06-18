import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectName } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentProjectName: string;
  onRename?: (newName: string) => void;
}

const RenameProjectDialog = ({ 
  isOpen, 
  onClose, 
  projectId, 
  currentProjectName,
  onRename 
}: RenameProjectDialogProps) => {
  const [newProjectName, setNewProjectName] = useState(currentProjectName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  // Validate project name format
  const validateProjectName = (name: string): boolean => {
    const projectNameRegex = /^[a-z0-9-]+$/;
    return projectNameRegex.test(name) && name.length > 0;
  };

  const isValidName = validateProjectName(newProjectName);
  const hasChanged = newProjectName !== currentProjectName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidName || !hasChanged || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = await getAccessTokenSilently();
      await updateProjectName(token, projectId, newProjectName);
      
      toast({
        title: "Success",
        description: "Project renamed successfully",
      });
      
      if (onRename) {
        onRename(newProjectName);
      }
      
      onClose();
    } catch (error) {
      console.error('Error renaming project:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to rename project: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewProjectName(currentProjectName); // Reset to original name
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Give your project a new name.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Project Name
            </Label>
            <Input
              id="project-name"
              name="newProjectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter new project name"
              aria-invalid={!isValidName}
            />
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and hyphens only. Example: my-awesome-project
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidName || !hasChanged || isSubmitting}
            >
              {isSubmitting ? "Renaming..." : "Rename Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameProjectDialog; 