
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Download, RotateCcw, Maximize, VolumeX } from "lucide-react";
import { VideoMessage } from "@/pages/Chat";

interface VideoTimelineProps {
  videos: VideoMessage[];
  currentVideoId: string | null;
  isGenerating: boolean;
  onVideoSelect: (videoId: string) => void;
}

const VideoTimeline = ({ videos, currentVideoId, isGenerating, onVideoSelect }: VideoTimelineProps) => {
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState<{ [key: string]: number }>({});
  const [videoDuration, setVideoDuration] = useState<{ [key: string]: number }>({});
  const [videoVolume, setVideoVolume] = useState<{ [key: string]: number }>({});
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const videoElementRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Scroll to current video when selection changes
  useEffect(() => {
    if (currentVideoId && videoRefs.current[currentVideoId]) {
      videoRefs.current[currentVideoId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVideoId]);

  const handlePlayPause = (videoId: string) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    if (playingVideos.has(videoId)) {
      videoElement.pause();
      setPlayingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      videoElement.play();
      setPlayingVideos(prev => new Set([...prev, videoId]));
    }
  };

  const handleTimeUpdate = (videoId: string) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    const progress = (videoElement.currentTime / videoElement.duration) * 100;
    setVideoProgress(prev => ({ ...prev, [videoId]: progress }));
  };

  const handleLoadedMetadata = (videoId: string) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    setVideoDuration(prev => ({ ...prev, [videoId]: videoElement.duration }));
    setVideoVolume(prev => ({ ...prev, [videoId]: videoElement.volume * 100 }));
  };

  const handleProgressChange = (videoId: string, value: number[]) => {
    const videoElement = videoElementRefs.current[videoId];
    const duration = videoDuration[videoId];
    if (!videoElement || !duration) return;

    const newTime = (value[0] / 100) * duration;
    videoElement.currentTime = newTime;
    setVideoProgress(prev => ({ ...prev, [videoId]: value[0] }));
  };

  const handleVolumeChange = (videoId: string, value: number[]) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    const newVolume = value[0] / 100;
    videoElement.volume = newVolume;
    setVideoVolume(prev => ({ ...prev, [videoId]: value[0] }));
    
    if (newVolume === 0) {
      setIsMuted(prev => ({ ...prev, [videoId]: true }));
    } else {
      setIsMuted(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const handleMuteToggle = (videoId: string) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    const currentlyMuted = isMuted[videoId] || false;
    videoElement.muted = !currentlyMuted;
    setIsMuted(prev => ({ ...prev, [videoId]: !currentlyMuted }));
  };

  const handleFullscreen = (videoId: string) => {
    const videoElement = videoElementRefs.current[videoId];
    if (!videoElement) return;

    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Video Timeline</h2>
            <p className="text-sm text-white/60">
              {videos.length} video{videos.length !== 1 ? 's' : ''} generated
              {isGenerating && <span className="ml-2 text-purple-400">• Generating new video...</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Video Timeline - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {videos.map((video) => (
              <div
                key={video.id}
                ref={(el) => {
                  if (el) videoRefs.current[video.id] = el;
                }}
                className={`rounded-lg border transition-all ${
                  currentVideoId === video.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/20 bg-white/5"
                }`}
                onClick={() => onVideoSelect(video.id)}
              >
                {/* Video Player */}
                <div className="relative w-full h-64 bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) {
                        videoElementRefs.current[video.id] = el;
                        el.addEventListener('timeupdate', () => handleTimeUpdate(video.id));
                        el.addEventListener('loadedmetadata', () => handleLoadedMetadata(video.id));
                      }
                    }}
                    className="w-full h-full object-contain"
                    src={video.videoUrl}
                    controls={false}
                  />
                  
                  {/* Custom Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <Slider
                          value={[videoProgress[video.id] || 0]}
                          onValueChange={(value) => handleProgressChange(video.id, value)}
                          max={100}
                          step={0.1}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex justify-between text-xs text-white/70 mt-1">
                          <span>{formatTime((videoProgress[video.id] || 0) * (videoDuration[video.id] || 0) / 100)}</span>
                          <span>{formatTime(videoDuration[video.id] || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(video.id);
                          }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                          {playingVideos.has(video.id) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        {/* Volume Control */}
                        <div className="flex items-center gap-2 flex-1 max-w-32">
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMuteToggle(video.id);
                            }}
                          >
                            {isMuted[video.id] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                          <Slider
                            value={[videoVolume[video.id] || 100]}
                            onValueChange={(value) => handleVolumeChange(video.id, value)}
                            max={100}
                            step={1}
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFullscreen(video.id);
                          }}
                        >
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{video.prompt}</h4>
                    {currentVideoId === video.id && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/50 text-sm">
                      {video.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoTimeline;
