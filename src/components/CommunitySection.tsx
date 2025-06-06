import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CommunitySection = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/community');
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
    },
    {
      title: "Music Video",
      description: "Creative visual storytelling with beats",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
    },
    {
      title: "Food Commercial",
      description: "Mouth-watering culinary showcase",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop"
    },
    {
      title: "Fashion Show",
      description: "Runway moments and style highlights",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=200&fit=crop"
    },
    {
      title: "Sports Highlights",
      description: "Athletic achievements and victories",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop"
    },
    {
      title: "Gaming Montage",
      description: "Epic gaming moments compilation",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop"
    },
    {
      title: "Architecture Tour",
      description: "Modern building design showcase",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop"
    },
    {
      title: "Science Experiment",
      description: "Educational lab demonstration",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop"
    },
    {
      title: "Dance Performance",
      description: "Choreography and movement art",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="px-6 py-8 bg-black/20 backdrop-blur-sm rounded-2xl">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-bold text-white">From the Community</h2>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 hover:text-white flex items-center gap-2"
          onClick={handleViewAll}
        >
          View All
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
                className="w-full h-full object-cover"
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
  );
};

export default CommunitySection;
