
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import Container from "@/components/Container";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full border-b border-transparent transition-all duration-200 ease-out ${
      isScrolled ? 'backdrop-blur-md bg-background/80' : ''
    }`}>
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
            <Video className="w-10 h-10 text-purple-400" />
            <span className="text-2xl font-bold text-white">Pamba</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-white/80">
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
      </Container>
    </nav>
  );
};

export default Navbar;
