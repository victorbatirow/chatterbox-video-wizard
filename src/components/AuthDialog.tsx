
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Video, X } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white/10 backdrop-blur-sm border-white/20">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-white"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-start gap-4">
          <Video className="w-9 h-9 text-purple-400" />
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-3xl font-medium tracking-tight text-white">
              Join and start building
            </DialogTitle>
            <DialogDescription className="text-sm text-white/60">
              Log in or create a free account to start building your dream application
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="mt-4 flex flex-col gap-3">
          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
          >
            Log in
          </Button>
          <Button
            onClick={handleSignup}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Sign up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
