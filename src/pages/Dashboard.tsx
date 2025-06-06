
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus, Search, Video, Play } from "lucide-react";
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
      title: "Product Demo Video",
      description: "AI-generated product showcase",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop",
      lastModified: "2 hours ago"
    },
    {
      id: 2,
      title: "Nature Documentary",
      description: "Wildlife scenes compilation",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      lastModified: "1 day ago"
    },
    {
      id: 3,
      title: "Corporate Presentation",
      description: "Business meeting highlights",
      thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      lastModified: "3 days ago"
    },
    {
      id: 4,
      title: "Travel Vlog",
      description: "Adventure moments captured",
      thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop",
      lastModified: "1 week ago"
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

        {/* Recent Projects */}
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

          <div className="grid md:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-white/10 border-white/20 overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                onClick={handleProjectClick}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-white/60 mb-2">{project.description}</p>
                  <p className="text-xs text-white/40">Modified {project.lastModified}</p>
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
