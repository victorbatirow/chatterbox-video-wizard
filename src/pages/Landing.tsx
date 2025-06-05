
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Heart, Sparkles, Code, Palette, Zap } from "lucide-react";

const Landing = () => {
  const [prompt, setPrompt] = useState("");

  const handleGetStarted = () => {
    if (prompt.trim()) {
      // For now, just navigate to the main app
      window.location.href = "/app";
    }
  };

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "AI-Powered Development",
      description: "Build applications by simply describing what you want"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Design",
      description: "Get polished, responsive designs out of the box"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "See your ideas come to life in real-time"
    }
  ];

  const projects = [
    {
      title: "Video Generator",
      description: "AI-powered video creation tool",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop"
    },
    {
      title: "Task Manager",
      description: "Productivity dashboard with team collaboration",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop"
    },
    {
      title: "E-commerce Store",
      description: "Modern online shopping experience",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop"
    },
    {
      title: "Portfolio Site",
      description: "Creative showcase for professionals",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500" />
          <span className="text-xl font-bold text-white">Lovable</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-white/80">
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Teams</a>
          <a href="#" className="hover:text-white transition-colors">Learn</a>
          <a href="#" className="hover:text-white transition-colors">Shipped</a>
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
          Build something{" "}
          <span className="inline-flex items-center gap-2">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
            Lovable
          </span>
        </h1>
        <p className="text-xl text-white/70 mb-12 max-w-2xl">
          Create apps and websites by chatting with AI
        </p>

        {/* Prompt Input */}
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-12">
          <div className="flex gap-4">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
            />
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              disabled={!prompt.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/60">Public</span>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-4xl">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4 text-purple-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* From the Community */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">From the Community</h2>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              View All
            </Button>
          </div>

          <div className="flex gap-4 mb-8">
            {["Popular", "Discover", "Internal Tools", "Website", "Personal", "Consumer App", "B2B App", "Prototype"].map((tag) => (
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
