
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Plus, Search, Settings, LogOut, Clock, Users, Globe } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Last edited");
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "Video AI Studio",
      description: "AI-powered video generation tool",
      lastEdited: "2 hours ago",
      collaborators: 1,
      isPublic: false,
      color: "from-purple-500 to-blue-500"
    },
    {
      id: 2,
      title: "Task Manager Pro",
      description: "Productivity dashboard with team features",
      lastEdited: "1 day ago",
      collaborators: 3,
      isPublic: true,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      title: "E-commerce Platform",
      description: "Modern online shopping experience",
      lastEdited: "3 days ago",
      collaborators: 2,
      isPublic: false,
      color: "from-orange-500 to-red-500"
    },
    {
      id: 4,
      title: "Portfolio Website",
      description: "Creative showcase for professionals",
      lastEdited: "1 week ago",
      collaborators: 1,
      isPublic: true,
      color: "from-pink-500 to-purple-500"
    }
  ];

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (projectId: number) => {
    navigate('/app');
  };

  const handleCreateProject = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold text-white">Lovable</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-white/80">
            <a href="#" className="hover:text-white transition-colors">Community</a>
            <a href="#" className="hover:text-white transition-colors">Teams</a>
            <a href="#" className="hover:text-white transition-colors">Learn</a>
            <a href="#" className="hover:text-white transition-colors">Shipped</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            V
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">victor's Lovable's Workspace</h1>
          <p className="text-white/60">Welcome back! Ready to build something amazing?</p>
        </div>

        {/* Create New Project */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Describe the app you want to build..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
              />
              <Button 
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search projects..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="Last edited">Last edited</option>
              <option value="Alphabetical">Alphabetical</option>
              <option value="Recently created">Recently created</option>
            </select>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            View All
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden group hover:scale-105 transition-transform cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className={`h-32 bg-gradient-to-br ${project.color} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 right-3 flex gap-2">
                  {project.isPublic && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate">{project.title}</h3>
                <p className="text-sm text-white/60 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.lastEdited}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.collaborators}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-white/60">No projects found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
