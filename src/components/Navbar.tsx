
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Video, Settings, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Container from "@/components/Container";
import SettingsDialog from "@/components/SettingsDialog";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const { logout, user } = useAuth0();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateNewProject = () => {
    setIsDropdownOpen(false);
    navigate('/chat');
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    if (isAuthenticated && logout) {
      logout({ logoutParams: { returnTo: window.location.origin } });
    } else {
      navigate('/');
    }
  };

  const handleOpenSettings = () => {
    setIsDropdownOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full border-b border-transparent transition-all duration-200 ease-out bg-slate-900 ${
        isScrolled ? 'backdrop-blur-md bg-slate-900/95' : ''
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
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 rounded-xl py-2 pl-2 pr-3 hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-white font-medium text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col">
                      <p className="text-sm font-medium min-w-0 max-w-[250px] truncate">
                        {user?.name || 'User'}'s Pamba
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[280px] z-[9999] bg-popover border shadow-md rounded-xl p-1"
                >
                  {/* User Info Header */}
                  <div className="my-2 flex items-center gap-2 px-1.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-white font-medium text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center gap-[2px] leading-none">
                      <p className="text-sm font-medium">{user?.name || 'User'}'s Pamba</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'user@email.com'}</p>
                    </div>
                  </div>

                  <div className="px-1.5 pb-1.5"></div>

                  {/* Credits Used Section */}
                  <div className="flex flex-col gap-1 px-1.5 pb-1.5 pt-1">
                    <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Credits Used</p>
                        <p className="text-xs font-medium text-muted-foreground cursor-pointer hover:opacity-80">
                          Manage
                        </p>
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <div className="relative w-full overflow-hidden rounded-full bg-muted-foreground/20 h-[7px] min-w-0 flex-1">
                          <div 
                            className="h-full bg-purple-600 transition-all" 
                            style={{ width: '30%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">30/100</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings and Invite Buttons */}
                  <div className="flex flex-row gap-1.5 px-1.5 pb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-muted border-input hover:bg-accent h-8 px-[11px]"
                      onClick={handleOpenSettings}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-muted border-input hover:bg-accent h-8 px-[11px]"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>

                  <DropdownMenuSeparator />

                  {/* User Badge */}
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Avatar className="h-[26px] w-[26px]">
                      <AvatarFallback className="bg-purple-600 text-white font-medium text-xs">
                        V
                      </AvatarFallback>
                    </Avatar>
                    <p className="min-w-0 truncate text-sm">victor's Pamba</p>
                    <span className="rounded-full px-2 py-px text-[10px] font-medium uppercase bg-purple-600 text-white">
                      Pro
                    </span>
                  </div>

                  {/* Create New Project */}
                  <DropdownMenuItem 
                    className="gap-3.5 px-3 py-2.5 cursor-pointer"
                    onClick={handleCreateNewProject}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 -960 960 960" 
                      className="shrink-0 h-4 w-4" 
                      fill="currentColor"
                    >
                      <path d="M450-450H230q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h220v-220q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38v220h220q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H510v220q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37z"/>
                    </svg>
                    <p>Create new project</p>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Help Center */}
                  <DropdownMenuItem className="gap-2 px-2 py-1.5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 -960 960 960" 
                      className="shrink-0 h-5 w-5" 
                      fill="currentColor"
                    >
                      <path d="M484.03-247Q500-247 511-258.03t11-27T510.97-312t-27-11T457-311.97t-11 27T457.03-258t27 11m-3.2-314q14.02 0 23.52-9.2T513-626q0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8t23.5 9.2m.29 514q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34T80-480.5t31.5-155.66 86-126.84 127.34-85.5T480.5-880t155.66 31.5T763-763t85.5 127T880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80m.23-60Q622-140 721-239.5t99-241T721.19-721 480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5m-.5-340"/>
                    </svg>
                    <p>Help Center</p>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}
                  <DropdownMenuItem 
                    className="gap-2 px-2 py-1.5 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 -960 960 960" 
                      className="shrink-0 h-5 w-5" 
                      fill="currentColor"
                    >
                      <path d="M230-90q-24.75 0-42.37-17.63Q170-125.25 170-150v-660q0-24.75 17.63-42.38Q205.25-870 230-870h500q24.75 0 42.38 17.62Q790-834.75 790-810v660q0 24.75-17.62 42.37Q754.75-90 730-90zm0-60h500v-660H230zm390.12-280q20.88 0 35.38-14.62t14.5-35.5-14.62-35.38-35.5-14.5-35.38 14.62-14.5 35.5 14.62 35.38 35.5 14.5M230-810v660z"/>
                    </svg>
                    <p>Sign out</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;
