
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Download, RotateCcw } from "lucide-react";

interface VideoViewerProps {
  videoUrl: string | null;
  isGenerating: boolean;
}

const VideoViewer = ({ videoUrl, isGenerating }: VideoViewerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isGenerating) {
    return (
      <div className="h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Generating Your Video</h3>
          <p className="text-white/60">This may take a few moments...</p>
          <div className="w-64 h-2 bg-white/10 rounded-full mx-auto mt-4">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Create</h3>
          <p className="text-white/60 leading-relaxed">
            Start a conversation in the chat to generate your first AI video. 
            Describe exactly what you want to see!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Generated Video</h2>
            <p className="text-sm text-white/60">Ready to preview</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RotateCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 p-6">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-contain"
            src={videoUrl}
            controls={false}
          />
          
          {/* Custom Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={handlePlayPause}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full w-1/3"></div>
                </div>
                
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-6 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Video Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Duration:</span>
              <span className="text-white ml-2">0:30</span>
            </div>
            <div>
              <span className="text-white/60">Resolution:</span>
              <span className="text-white ml-2">1080p</span>
            </div>
            <div>
              <span className="text-white/60">Format:</span>
              <span className="text-white ml-2">MP4</span>
            </div>
            <div>
              <span className="text-white/60">Size:</span>
              <span className="text-white ml-2">12.5 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;
