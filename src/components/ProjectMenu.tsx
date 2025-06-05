
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

const ProjectMenu = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          <span className="text-sm">video-generation-project</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={handleGoToDashboard}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go to Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
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
  );
};

export default ProjectMenu;
