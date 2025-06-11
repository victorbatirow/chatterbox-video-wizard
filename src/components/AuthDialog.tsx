
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { Video } from "lucide-react";

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
      <DialogContent className="max-w-sm bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <div className="flex flex-col items-start gap-4">
          {/* Logo */}
          <Video className="h-9 w-9 text-purple-400" />
          
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-left">
            <h2 className="font-medium tracking-tight text-3xl">Join and start building</h2>
            <p className="text-sm text-white/60">
              Log in or create a free account to start building your dream application
            </p>
          </div>
        </div>

        {/* Buttons */}
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
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Sign up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
