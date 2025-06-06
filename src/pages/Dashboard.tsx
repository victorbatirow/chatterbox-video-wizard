
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus, Search, Video, Play, Calendar, MoreVertical } from "lucide-react";
import VideoPromptInput from "@/components/VideoPromptInput";
import CommunitySection from "@/components/CommunitySection";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/app');
  };

  const handleProjectClick = () => {
    navigate('/app');
  };

  const handleCreateVideoFromPrompt = (prompt: string) => {
    // Navigate to app with the prompt (in a real app, you'd pass this as state or URL param)
    navigate('/app');
  };

  const projects = [
    {
      id: 1,
      title: "Cooking Tutorial",
      description: "Delicious recipe walkthrough",
      thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
      lastModified: "2 hours ago",
      duration: "2:45"
    },
    {
      id: 2,
      title: "Fitness Workout",
      description: "Home exercise routine",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      lastModified: "1 day ago",
      duration: "5:12"
    },
    {
      id: 3,
      title: "Art Process",
      description: "Digital painting timelapse",
      thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop",
      lastModified: "3 days ago",
      duration: "3:28"
    },
    {
      id: 4,
      title: "Travel Vlog",
      description: "City exploration adventure",
      thumbnail: "https://images.unsplash.com/photo-1539650116574-75c0c6d0c96b?w=300&h=200&fit=crop",
      lastModified: "1 week ago",
      duration: "4:33"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Video className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold text-white">Pamba</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Profile
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Settings
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            Sign out
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Victor's Pamba Workspace
          </h1>
          <p className="text-xl text-white/70">
            Ready to create something amazing?
          </p>
        </div>

        {/* Video Creation Prompt */}
        <div className="flex justify-center mb-8">
          <VideoPromptInput onSubmit={handleCreateVideoFromPrompt} />
        </div>

        {/* Recent Projects - Back to Original Card Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Video Projects</h2>
            <Button 
              onClick={handleCreateProject}
              variant="ghost" 
              className="text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Empty Project
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-white/10 border-white/20 overflow-hidden group hover:scale-105 transition-transform cursor-pointer"
                onClick={handleProjectClick}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-sm text-white/60 mb-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{project.lastModified}</span>
                    <span>{project.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* From the Community */}
      <CommunitySection />
    </div>
  );
};

export default Dashboard;
