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
  const [hasAudio, setHasAudio] = useState<{ [key: string]: boolean }>({});
  const [isDragging, setIsDragging] = useState<{ [key: string]: 'progress' | 'volume' | null }>({});
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

  // Mouse move and up event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      Object.entries(isDragging).forEach(([videoId, dragType]) => {
        if (dragType) {
          const sliderElement = document.querySelector(`[data-slider="${videoId}-${dragType}"]`) as HTMLElement;
          if (sliderElement) {
            const rect = sliderElement.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            
            if (dragType === 'progress') {
              handleProgressChange(videoId, [percentage]);
            } else if (dragType === 'volume') {
              handleVolumeChange(videoId, [percentage]);
            }
          }
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging({});
    };

    if (Object.values(isDragging).some(drag => drag !== null)) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
    
    // Check if video has audio tracks
    const audioTracks = videoElement.audioTracks || [];
    const hasAudioTracks = audioTracks.length > 0;
    
    // Also check if the video element has audio by checking if it can be muted
    // Some videos without audio tracks might still have silent audio
    const canMute = !videoElement.muted;
    videoElement.muted = true;
    const volumeWhenMuted = videoElement.volume;
    videoElement.muted = false;
    const hasWorkingAudio = canMute && volumeWhenMuted !== undefined;
    
    const videoHasAudio = hasAudioTracks || hasWorkingAudio;
    
    setHasAudio(prev => ({ ...prev, [videoId]: videoHasAudio }));
    
    if (videoHasAudio) {
      setVideoVolume(prev => ({ ...prev, [videoId]: videoElement.volume * 100 }));
      setIsMuted(prev => ({ ...prev, [videoId]: false }));
    } else {
      // If no audio, set volume to 0 and mute by default
      videoElement.volume = 0;
      videoElement.muted = true;
      setVideoVolume(prev => ({ ...prev, [videoId]: 0 }));
      setIsMuted(prev => ({ ...prev, [videoId]: true }));
    }
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
    if (!videoElement || !hasAudio[videoId]) return;

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
    if (!videoElement || !hasAudio[videoId]) return;

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

  const handleDownload = async (videoUrl: string, prompt: string) => {
    try {
      // Fetch the video as a blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
      // Fallback to direct link if blob fetch fails
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSliderClick = (e: React.MouseEvent, videoId: string, type: 'progress' | 'volume') => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    if (type === 'progress') {
      handleProgressChange(videoId, [percentage]);
    } else {
      handleVolumeChange(videoId, [percentage]);
    }
  };

  const handleSliderMouseDown = (e: React.MouseEvent, videoId: string, type: 'progress' | 'volume') => {
    e.stopPropagation();
    setIsDragging(prev => ({ ...prev, [videoId]: type }));
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
                <div className="relative w-full h-80 bg-black rounded-t-lg overflow-hidden">
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
                        <div 
                          className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer"
                          data-slider={`${video.id}-progress`}
                          onClick={(e) => handleSliderClick(e, video.id, 'progress')}
                          onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'progress')}
                        >
                          <div 
                            className="absolute h-full bg-white rounded-full transition-all duration-150"
                            style={{ width: `${videoProgress[video.id] || 0}%` }}
                          />
                          <div 
                            className="absolute w-4 h-4 bg-white rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                            style={{ left: `${videoProgress[video.id] || 0}%` }}
                            onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'progress')}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/70 mt-1">
                          <span>{formatTime((videoProgress[video.id] || 0) * (videoDuration[video.id] || 0) / 100)}</span>
                          <span>{formatTime(videoDuration[video.id] || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Left side controls */}
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
                          
                          {/* Volume Control - Only show if video has audio */}
                          {hasAudio[video.id] && (
                            <div className="flex items-center gap-2 max-w-32">
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
                              <div 
                                className="relative w-20 h-1 bg-white/20 rounded-full cursor-pointer"
                                data-slider={`${video.id}-volume`}
                                onClick={(e) => handleSliderClick(e, video.id, 'volume')}
                                onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'volume')}
                              >
                                <div 
                                  className="absolute h-full bg-white rounded-full transition-all duration-150"
                                  style={{ width: `${videoVolume[video.id] || 100}%` }}
                                />
                                <div 
                                  className="absolute w-3 h-3 bg-white rounded-full border border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                                  style={{ left: `${videoVolume[video.id] || 100}%` }}
                                  onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'volume')}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Show indicator when video has no audio */}
                          {hasAudio[video.id] === false && (
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                              <VolumeX className="w-4 h-4" />
                              <span>No audio</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Right side controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add regenerate functionality here
                              console.log('Regenerate video:', video.id);
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(video.videoUrl, video.prompt);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
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
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{video.prompt}</h4>
                    {currentVideoId === video.id && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">
                    {video.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
