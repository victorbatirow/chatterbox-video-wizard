
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, Search, Video, Play, Calendar, MoreVertical } from "lucide-react";
import VideoPromptInput from "@/components/VideoPromptInput";
import CommunitySection from "@/components/CommunitySection";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("last-edited");
  const [showAllProjects, setShowAllProjects] = useState(false);

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

  const allProjects = [
    {
      id: 1,
      title: "Morning Yoga Routine",
      description: "Peaceful sunrise yoga session",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      lastModified: "2 hours ago",
      duration: "15:32",
      dateCreated: new Date('2024-06-06')
    },
    {
      id: 2,
      title: "JavaScript Tutorial",
      description: "Learn async/await patterns",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop",
      lastModified: "5 hours ago",
      duration: "12:45",
      dateCreated: new Date('2024-06-05')
    },
    {
      id: 3,
      title: "Watercolor Painting",
      description: "Landscape painting techniques",
      thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&h=200&fit=crop",
      lastModified: "1 day ago",
      duration: "8:21",
      dateCreated: new Date('2024-06-04')
    },
    {
      id: 4,
      title: "City Photography",
      description: "Urban street photography tips",
      thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop",
      lastModified: "2 days ago",
      duration: "6:47",
      dateCreated: new Date('2024-06-03')
    },
    {
      id: 5,
      title: "Guitar Lesson",
      description: "Beginner chord progressions",
      thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=200&fit=crop",
      lastModified: "3 days ago",
      duration: "18:15",
      dateCreated: new Date('2024-06-02')
    },
    {
      id: 6,
      title: "Baking Masterclass",
      description: "Perfect sourdough bread",
      thumbnail: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
      lastModified: "4 days ago",
      duration: "22:33",
      dateCreated: new Date('2024-06-01')
    },
    {
      id: 7,
      title: "Mountain Hiking",
      description: "Alpine adventure documentary",
      thumbnail: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=200&fit=crop",
      lastModified: "5 days ago",
      duration: "14:28",
      dateCreated: new Date('2024-05-31')
    },
    {
      id: 8,
      title: "Digital Marketing",
      description: "Social media strategy guide",
      thumbnail: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=300&h=200&fit=crop",
      lastModified: "6 days ago",
      duration: "25:12",
      dateCreated: new Date('2024-05-30')
    },
    {
      id: 9,
      title: "Home Renovation",
      description: "DIY kitchen makeover",
      thumbnail: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=300&h=200&fit=crop",
      lastModified: "1 week ago",
      duration: "31:45",
      dateCreated: new Date('2024-05-29')
    },
    {
      id: 10,
      title: "Meditation Guide",
      description: "Mindfulness for beginners",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      lastModified: "1 week ago",
      duration: "10:33",
      dateCreated: new Date('2024-05-28')
    }
  ];

  const sortProjects = (projects: typeof allProjects) => {
    const sorted = [...projects];
    switch (sortBy) {
      case "date-created":
        return sorted.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "last-edited":
      default:
        return sorted; // Already sorted by last edited in the data
    }
  };

  const sortedProjects = sortProjects(allProjects);
  const visibleProjects = showAllProjects ? sortedProjects : sortedProjects.slice(0, 7);

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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Recent Video Projects</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-edited">Last edited</SelectItem>
                  <SelectItem value="date-created">Date created</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              View All
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {visibleProjects.map((project) => (
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

            {/* Create Project Card */}
            <Card 
              className="bg-white/5 border-white/20 border-dashed overflow-hidden group hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
              onClick={handleCreateProject}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                <Plus className="w-12 h-12 text-white/60 mb-3" />
                <h3 className="font-semibold text-white mb-1">Create Project</h3>
                <p className="text-sm text-white/40">Start a new video project</p>
              </CardContent>
            </Card>
          </div>

          {/* Show More Button */}
          {!showAllProjects && sortedProjects.length > 7 && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => setShowAllProjects(true)}
                variant="ghost" 
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Show More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* From the Community */}
      <CommunitySection />
    </div>
  );
};

export default Dashboard;
