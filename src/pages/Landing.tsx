
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Plus } from "lucide-react";
import VideoPromptInput from "@/components/VideoPromptInput";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = (prompt: string) => {
    // For now, just navigate to the main app
    window.location.href = "/app";
  };

  const projects = [
    {
      title: "Product Showcase",
      description: "AI-generated product demo video",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop"
    },
    {
      title: "Nature Documentary",
      description: "Wildlife scenes with stunning visuals",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop"
    },
    {
      title: "Travel Adventure",
      description: "Epic journey through beautiful landscapes",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop"
    },
    {
      title: "Corporate Video",
      description: "Professional business presentation",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
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
        <div className="hidden md:flex items-center gap-6 text-white/80">
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Gallery</a>
          <a href="#" className="hover:text-white transition-colors">Learn</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-white text-purple-900 hover:bg-white/90">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Create videos with{" "}
          <span className="inline-flex items-center gap-2">
            <Video className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
            Pamba
          </span>
        </h1>
        <p className="text-xl text-white/70 mb-12 max-w-2xl">
          Generate stunning videos by chatting with AI
        </p>

        {/* Prompt Input */}
        <div className="mb-12 w-full max-w-4xl px-6">
          <VideoPromptInput onSubmit={handleGetStarted} />
        </div>
      </div>

      {/* From the Community */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">From the Community</h2>
            <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Empty Project
            </Button>
          </div>

          <div className="flex gap-4 mb-8">
            {["Popular", "Discover", "Cinematic", "Product Demo", "Nature", "Animation", "Tutorial", "Music Video"].map((tag) => (
              <Button
                key={tag}
                variant={tag === "Popular" ? "default" : "ghost"}
                className={tag === "Popular" ? "bg-white text-purple-900" : "text-white/60 hover:text-white hover:bg-white/10"}
                size="sm"
              >
                {tag}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="bg-white/10 border-white/20 overflow-hidden group hover:scale-105 transition-transform">
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-sm text-white/60">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
