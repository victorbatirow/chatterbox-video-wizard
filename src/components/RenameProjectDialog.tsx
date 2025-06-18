import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectName } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentProjectName: string;
  onRename?: (newName: string) => void;
}

// Custom DialogContent with higher z-index
const HighZDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="fixed inset-0 z-[10002] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[10002] grid w-full max-w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-6 shadow-modal duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] md:max-w-sm",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus the input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewProjectName(currentProjectName);
    }
  }, [isOpen, currentProjectName]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <HighZDialogContent>
        <DialogTitle className="text-lg font-medium leading-none tracking-tight">
          Rename project
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Give your project a new name.
        </DialogDescription>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Project Name
              </Label>
              <Input
                ref={inputRef}
                id="project-name"
                name="newProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter new project name"
                aria-invalid={!isValidName}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Use lowercase letters, numbers, and hyphens only. Example: my-awesome-project
              </p>
            </div>
          </div>
          
          <div className="flex flex-row justify-between gap-2 sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidName || !hasChanged || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Renaming..." : "Rename Project"}
            </Button>
          </div>
        </form>
      </HighZDialogContent>
    </Dialog>
  );
};

export default RenameProjectDialog; 