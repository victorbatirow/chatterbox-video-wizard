
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between p-6">
      <div className="flex items-center gap-6">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
          <Video className="w-10 h-10 text-purple-400" />
          <span className="text-2xl font-bold text-white">Pamba</span>
        </Link>
        <div className="flex items-center gap-6 text-white/80">
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Gallery</a>
          <a href="#" className="hover:text-white transition-colors">Learn</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Profile
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Settings
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-purple-900 hover:bg-white/90">
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
