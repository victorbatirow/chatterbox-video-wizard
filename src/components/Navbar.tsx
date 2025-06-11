
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const { loginWithRedirect, logout } = useAuth0();

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

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="w-full backdrop-blur-md bg-black/20 z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Video className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold text-white">Pamba</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-1">
          <Link to="/" className="text-white/70 hover:text-white px-3 py-2 rounded-md">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-white/70 hover:text-white px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="/projects" className="text-white/70 hover:text-white px-3 py-2 rounded-md">
                Projects
              </Link>
              <Link to="/community" className="text-white/70 hover:text-white px-3 py-2 rounded-md">
                Community
              </Link>
            </>
          )}
        </nav>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Log Out
            </Button>
          ) : (
            <>
              <Button
                onClick={handleLogin}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Log In
              </Button>
              <Button
                onClick={handleSignup}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
