
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Volume2, Download, RotateCcw } from "lucide-react";
import { VideoMessage } from "@/pages/Chat";

interface VideoTimelineProps {
  videos: VideoMessage[];
  currentVideoId: string | null;
  isGenerating: boolean;
  onVideoSelect: (videoId: string) => void;
}

const VideoTimeline = ({ videos, currentVideoId, isGenerating, onVideoSelect }: VideoTimelineProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const currentVideo = videos.find(video => video.id === currentVideoId);

  // Scroll to current video when selection changes
  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      videoRefs.current[currentVideoId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVideoId]);

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

  if (videos.length === 0) {
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
            <h2 className="text-lg font-semibold text-white">Video Timeline</h2>
            <p className="text-sm text-white/60">{videos.length} video{videos.length !== 1 ? 's' : ''} generated</p>
          </div>
          {currentVideo && (
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
          )}
        </div>
      </div>

      {/* Video Player */}
      {currentVideo && (
        <div className="p-6 border-b border-white/10">
          <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-4">
            <video
              className="w-full h-full object-contain"
              src={currentVideo.videoUrl}
              controls={false}
            />
            
            {/* Custom Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4">
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

          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-white font-medium mb-1">Current Video</h4>
            <p className="text-white/70 text-sm">{currentVideo.prompt}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            <h3 className="text-white font-medium mb-4">Generated Videos</h3>
            {videos.map((video) => (
              <div
                key={video.id}
                ref={(el) => {
                  if (el) videoRefs.current[video.id] = el;
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  currentVideoId === video.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => onVideoSelect(video.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                    <video
                      className="w-full h-full object-cover"
                      src={video.videoUrl}
                      muted
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {video.prompt}
                    </p>
                    <p className="text-white/50 text-xs">
                      {video.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {currentVideoId === video.id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoTimeline;
