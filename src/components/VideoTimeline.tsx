import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Volume2, Download, RotateCcw, Maximize, VolumeX, Grid, Film } from "lucide-react";
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
  const [videoAspectRatios, setVideoAspectRatios] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState<{ [key: string]: 'progress' | 'volume' | null }>({});
  const [viewMode, setViewMode] = useState<'timeline' | 'clips' | 'final'>('timeline');
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

  // Mouse move and up event listeners for dragging
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

  // Group videos by message and type
  const groupedVideos = videos.reduce((acc, video) => {
    const messageId = video.messageId || 'unknown';
    if (!acc[messageId]) {
      acc[messageId] = { clips: [], final: null };
    }
    
    if (video.isClip) {
      acc[messageId].clips.push(video);
    } else {
      acc[messageId].final = video;
    }
    
    return acc;
  }, {} as Record<string, { clips: VideoMessage[], final: VideoMessage | null }>);

  // Filter videos based on view mode
  const getFilteredVideos = () => {
    switch (viewMode) {
      case 'clips':
        return videos.filter(v => v.isClip);
      case 'final':
        return videos.filter(v => !v.isClip);
      case 'timeline':
      default:
        return videos;
    }
  };

  const filteredVideos = getFilteredVideos();

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
    
    // Calculate and store aspect ratio
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    setVideoAspectRatios(prev => ({ ...prev, [videoId]: aspectRatio }));
    
    // Default to showing audio controls and reasonable volume
    // Let users manually mute if the video actually has no audio
    const defaultVolume = 80; // 80% volume
    videoElement.volume = defaultVolume / 100;
    videoElement.muted = false;
    
    setHasAudio(prev => ({ ...prev, [videoId]: true }));
    setVideoVolume(prev => ({ ...prev, [videoId]: defaultVolume }));
    setIsMuted(prev => ({ ...prev, [videoId]: false }));
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

  // Helper function to get responsive video container style
  const getVideoContainerStyle = (videoId: string, isClip: boolean = false) => {
    const aspectRatio = videoAspectRatios[videoId];
    
    if (!aspectRatio) {
      // Fallback for when aspect ratio is not yet loaded
      return {
        width: '100%',
        height: isClip ? '300px' : '500px',
        maxHeight: isClip ? '300px' : '70vh'
      };
    }
    
    const isPortrait = aspectRatio < 1;
    const isLandscape = aspectRatio > 1.2; // More clearly landscape
    const isSquareish = !isPortrait && !isLandscape; // Near square
    
    if (isClip) {
      // For clips, use more constrained dimensions
      if (isPortrait) {
        // Portrait: constrain by height, calculate width
        const height = 350;
        const width = height * aspectRatio;
        return {
          width: `${width}px`,
          height: `${height}px`,
          maxHeight: '400px',
          maxWidth: '300px'
        };
      } else if (isLandscape) {
        // Landscape: constrain by width, calculate height  
        const width = 400;
        const height = width / aspectRatio;
        return {
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '450px',
          maxHeight: '300px'
        };
      } else {
        // Square-ish: use square dimensions
        return {
          width: '280px',
          height: '280px',
          maxWidth: '320px',
          maxHeight: '320px'
        };
      }
    } else {
      // For final videos, use larger dimensions
      if (isPortrait) {
        // Portrait: constrain by height, calculate width
        const maxHeight = Math.min(window.innerHeight * 0.7, 600);
        const width = maxHeight * aspectRatio;
        return {
          width: `${width}px`,
          height: `${maxHeight}px`,
          maxHeight: '70vh',
          maxWidth: '500px'
        };
      } else if (isLandscape) {
        // Landscape: constrain by width, calculate height
        const maxWidth = Math.min(window.innerWidth * 0.8, 800);
        const height = maxWidth / aspectRatio;
        return {
          width: `${maxWidth}px`,
          height: `${height}px`,
          maxWidth: '90vw',
          maxHeight: '60vh'
        };
      } else {
        // Square-ish: use square dimensions
        const size = Math.min(window.innerHeight * 0.5, 500);
        return {
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '500px',
          maxHeight: '60vh'
        };
      }
    }
  };

  // Render video section for timeline view
  const renderVideoSection = (messageId: string, videoGroup: { clips: VideoMessage[], final: VideoMessage | null }) => {
    const { clips, final } = videoGroup;
    
    return (
      <div key={messageId} className="space-y-4 border-b border-white/10 pb-6 mb-6">
        {/* Clips Section */}
        {clips.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Individual Clips ({clips.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clips
                .sort((a, b) => (a.clipIndex || 0) - (b.clipIndex || 0))
                .map((clip) => (
                <div
                  key={clip.id}
                  ref={(el) => {
                    if (el) videoRefs.current[clip.id] = el;
                  }}
                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                    currentVideoId === clip.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/20 bg-white/5"
                  }`}
                  onClick={() => onVideoSelect(clip.id)}
                >
                  <div className="flex items-center justify-center p-2">
                    <div 
                      className="relative rounded overflow-hidden"
                      style={getVideoContainerStyle(clip.id, true)}
                    >
                      <video
                        ref={(el) => {
                          if (el) {
                            videoElementRefs.current[clip.id] = el;
                            el.addEventListener('timeupdate', () => handleTimeUpdate(clip.id));
                            el.addEventListener('loadedmetadata', () => handleLoadedMetadata(clip.id));
                          }
                        }}
                        className="w-full h-full object-contain"
                        src={clip.videoUrl}
                        controls={false}
                      />
                      
                      {/* Custom Controls for Clips */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 right-2">
                          {/* Progress Bar - Thinner for clips */}
                          <div className="mb-2">
                            <div 
                              className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer"
                              data-slider={`${clip.id}-progress`}
                              onClick={(e) => handleSliderClick(e, clip.id, 'progress')}
                              onMouseDown={(e) => handleSliderMouseDown(e, clip.id, 'progress')}
                            >
                              <div 
                                className="absolute h-full bg-white rounded-full transition-all duration-150"
                                style={{ width: `${videoProgress[clip.id] || 0}%` }}
                              />
                              <div 
                                className="absolute w-3 h-3 bg-white rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                                style={{ left: `${videoProgress[clip.id] || 0}%` }}
                                onMouseDown={(e) => handleSliderMouseDown(e, clip.id, 'progress')}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-white/70 mt-0.5">
                              <span>{formatTime((videoProgress[clip.id] || 0) * (videoDuration[clip.id] || 0) / 100)}</span>
                              <span>{formatTime(videoDuration[clip.id] || 0)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {/* Left side controls - Compact */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPause(clip.id);
                                }}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-7 w-7 p-0"
                              >
                                {playingVideos.has(clip.id) ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              </Button>
                              
                              {/* Volume Control - Compact */}
                              {hasAudio[clip.id] ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMuteToggle(clip.id);
                                    }}
                                  >
                                    {isMuted[clip.id] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                  </Button>
                                  <div 
                                    className="relative w-12 h-1 bg-white/20 rounded-full cursor-pointer"
                                    data-slider={`${clip.id}-volume`}
                                    onClick={(e) => handleSliderClick(e, clip.id, 'volume')}
                                    onMouseDown={(e) => handleSliderMouseDown(e, clip.id, 'volume')}
                                  >
                                    <div 
                                      className="absolute h-full bg-white rounded-full transition-all duration-150"
                                      style={{ width: `${videoVolume[clip.id] || 100}%` }}
                                    />
                                    <div 
                                      className="absolute w-2 h-2 bg-white rounded-full border border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                                      style={{ left: `${videoVolume[clip.id] || 100}%` }}
                                      onMouseDown={(e) => handleSliderMouseDown(e, clip.id, 'volume')}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-white/40 text-xs">
                                  <VolumeX className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            
                            {/* Right side controls - Compact */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(clip.videoUrl, `${clip.prompt} - Clip ${(clip.clipIndex || 0) + 1}`);
                                }}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFullscreen(clip.id);
                                }}
                              >
                                <Maximize className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="text-white/80 text-sm">
                      Clip {(clip.clipIndex || 0) + 1}
                    </p>
                    <p className="text-white/50 text-xs">
                      {clip.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Video Section */}
        {final && (
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Film className="w-4 h-4" />
              Final Video
            </h4>

            {/* Video container - only as wide as needed */}
            <div 
              ref={(el) => {
                if (el) videoRefs.current[final.id] = el;
              }}
              className={`cursor-pointer transition-all ${
                currentVideoId === final.id ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => onVideoSelect(final.id)}
            >
              <div className="flex items-center justify-center">
                <div 
                  className="relative rounded overflow-hidden shadow-lg"
                  style={getVideoContainerStyle(final.id, false)}
                >
                  <video
                    ref={(el) => {
                      if (el) {
                        videoElementRefs.current[final.id] = el;
                        el.addEventListener('timeupdate', () => handleTimeUpdate(final.id));
                        el.addEventListener('loadedmetadata', () => handleLoadedMetadata(final.id));
                      }
                    }}
                    className="w-full h-full object-contain"
                    src={final.videoUrl}
                    controls={false}
                  />
                  
                  {/* Full controls for final video */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div 
                          className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer"
                          data-slider={`${final.id}-progress`}
                          onClick={(e) => handleSliderClick(e, final.id, 'progress')}
                          onMouseDown={(e) => handleSliderMouseDown(e, final.id, 'progress')}
                        >
                          <div 
                            className="absolute h-full bg-white rounded-full transition-all duration-150"
                            style={{ width: `${videoProgress[final.id] || 0}%` }}
                          />
                          <div 
                            className="absolute w-4 h-4 bg-white rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                            style={{ left: `${videoProgress[final.id] || 0}%` }}
                            onMouseDown={(e) => handleSliderMouseDown(e, final.id, 'progress')}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/70 mt-1">
                          <span>{formatTime((videoProgress[final.id] || 0) * (videoDuration[final.id] || 0) / 100)}</span>
                          <span>{formatTime(videoDuration[final.id] || 0)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {/* Left side controls */}
                        <div className="flex items-center gap-4">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPause(final.id);
                            }}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                          >
                            {playingVideos.has(final.id) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          
                          {/* Volume Control */}
                          {hasAudio[final.id] ? (
                            <div className="flex items-center gap-2 max-w-32">
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMuteToggle(final.id);
                                }}
                              >
                                {isMuted[final.id] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </Button>
                              <div 
                                className="relative w-20 h-1 bg-white/20 rounded-full cursor-pointer"
                                data-slider={`${final.id}-volume`}
                                onClick={(e) => handleSliderClick(e, final.id, 'volume')}
                                onMouseDown={(e) => handleSliderMouseDown(e, final.id, 'volume')}
                              >
                                <div 
                                  className="absolute h-full bg-white rounded-full transition-all duration-150"
                                  style={{ width: `${videoVolume[final.id] || 100}%` }}
                                />
                                <div 
                                  className="absolute w-3 h-3 bg-white rounded-full border border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing"
                                  style={{ left: `${videoVolume[final.id] || 100}%` }}
                                  onMouseDown={(e) => handleSliderMouseDown(e, final.id, 'volume')}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-white/40 text-xs">
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
                              handleDownload(final.videoUrl, final.prompt);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFullscreen(final.id);
                            }}
                          >
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
      {/* Header with View Mode Toggles */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Video Timeline</h2>
            <p className="text-sm text-white/60">
              {videos.length} video{videos.length !== 1 ? 's' : ''} generated
              {isGenerating && <span className="ml-2 text-purple-400">• Generating new video...</span>}
            </p>
          </div>
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
            className="text-xs"
          >
            Timeline
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'clips' ? 'default' : 'outline'}
            onClick={() => setViewMode('clips')}
            className="text-xs"
          >
            <Grid className="w-3 h-3 mr-1" />
            Clips Only
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'final' ? 'default' : 'outline'}
            onClick={() => setViewMode('final')}
            className="text-xs"
          >
            <Film className="w-3 h-3 mr-1" />
            Final Videos
          </Button>
        </div>
      </div>

      {/* Video Content - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4">
            {viewMode === 'timeline' ? (
              // Timeline view - grouped by message
              Object.entries(groupedVideos)
                .sort(([, a], [, b]) => {
                  const aTime = a.final?.timestamp || a.clips[0]?.timestamp || new Date(0);
                  const bTime = b.final?.timestamp || b.clips[0]?.timestamp || new Date(0);
                  return aTime.getTime() - bTime.getTime();
                })
                .map(([messageId, videoGroup]) => renderVideoSection(messageId, videoGroup))
            ) : (
              // List view - individual videos
              <div className="space-y-6">
                {filteredVideos
                  .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                  .map((video) => (
                  <div key={video.id} className="space-y-4">
                    {/* Message info outside video container */}
                    <div 
                      ref={(el) => {
                        if (el) videoRefs.current[video.id] = el;
                      }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        currentVideoId === video.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/20 bg-white/5"
                      }`}
                      onClick={() => onVideoSelect(video.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                            {video.isClip ? (
                              <>
                                <Grid className="w-4 h-4" />
                                {video.prompt}
                              </>
                            ) : (
                              <>
                                <Film className="w-4 h-4" />
                                {video.prompt}
                              </>
                            )}
                          </h4>
                          <p className="text-white/50 text-sm">
                            {video.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {currentVideoId === video.id && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Video container - only as wide as needed */}
                    <div 
                      className={`cursor-pointer transition-all ${
                        currentVideoId === video.id ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => onVideoSelect(video.id)}
                    >
                      <div className="flex items-center justify-center">
                        <div 
                          className="relative rounded overflow-hidden shadow-lg"
                          style={getVideoContainerStyle(video.id, video.isClip)}
                        >
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
                          
                          {/* Standard video controls */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className={`absolute ${video.isClip ? 'bottom-2 left-2 right-2' : 'bottom-4 left-4 right-4'}`}>
                              {/* Progress Bar */}
                              <div className={video.isClip ? 'mb-2' : 'mb-3'}>
                                <div 
                                  className={`relative w-full ${video.isClip ? 'h-1' : 'h-2'} bg-white/20 rounded-full cursor-pointer`}
                                  data-slider={`${video.id}-progress`}
                                  onClick={(e) => handleSliderClick(e, video.id, 'progress')}
                                  onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'progress')}
                                >
                                  <div 
                                    className="absolute h-full bg-white rounded-full transition-all duration-150"
                                    style={{ width: `${videoProgress[video.id] || 0}%` }}
                                  />
                                  <div 
                                    className={`absolute ${video.isClip ? 'w-3 h-3' : 'w-4 h-4'} bg-white rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing`}
                                    style={{ left: `${videoProgress[video.id] || 0}%` }}
                                    onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'progress')}
                                  />
                                </div>
                                <div className={`flex justify-between text-xs text-white/70 ${video.isClip ? 'mt-0.5' : 'mt-1'}`}>
                                  <span>{formatTime((videoProgress[video.id] || 0) * (videoDuration[video.id] || 0) / 100)}</span>
                                  <span>{formatTime(videoDuration[video.id] || 0)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                {/* Left side controls */}
                                <div className={`flex items-center ${video.isClip ? 'gap-1' : 'gap-4'}`}>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayPause(video.id);
                                    }}
                                    className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm ${video.isClip ? 'h-7 w-7 p-0' : ''}`}
                                  >
                                    {playingVideos.has(video.id) ? <Pause className={video.isClip ? "w-3 h-3" : "w-4 h-4"} /> : <Play className={video.isClip ? "w-3 h-3" : "w-4 h-4"} />}
                                  </Button>
                                  
                                  {/* Volume Control */}
                                  {hasAudio[video.id] ? (
                                    <div className={`flex items-center ${video.isClip ? 'gap-1' : 'gap-2 max-w-32'}`}>
                                      <Button
                                        size="sm"
                                        className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm ${video.isClip ? 'h-7 w-7 p-0' : 'p-2'}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMuteToggle(video.id);
                                        }}
                                      >
                                        {isMuted[video.id] ? <VolumeX className={video.isClip ? "w-3 h-3" : "w-4 h-4"} /> : <Volume2 className={video.isClip ? "w-3 h-3" : "w-4 h-4"} />}
                                      </Button>
                                      <div 
                                        className={`relative ${video.isClip ? 'w-12' : 'w-20'} h-1 bg-white/20 rounded-full cursor-pointer`}
                                        data-slider={`${video.id}-volume`}
                                        onClick={(e) => handleSliderClick(e, video.id, 'volume')}
                                        onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'volume')}
                                      >
                                        <div 
                                          className="absolute h-full bg-white rounded-full transition-all duration-150"
                                          style={{ width: `${videoVolume[video.id] || 100}%` }}
                                        />
                                        <div 
                                          className={`absolute ${video.isClip ? 'w-2 h-2' : 'w-3 h-3'} bg-white rounded-full border border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 cursor-grab active:cursor-grabbing`}
                                          style={{ left: `${videoVolume[video.id] || 100}%` }}
                                          onMouseDown={(e) => handleSliderMouseDown(e, video.id, 'volume')}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className={`flex items-center ${video.isClip ? 'gap-1' : 'gap-2'} text-white/40 text-xs`}>
                                      <VolumeX className={video.isClip ? "w-3 h-3" : "w-4 h-4"} />
                                      {!video.isClip && <span>No audio</span>}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Right side controls */}
                                <div className={`flex items-center ${video.isClip ? 'gap-1' : 'gap-2'}`}>
                                  <Button
                                    size="sm"
                                    className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm ${video.isClip ? 'h-7 w-7 p-0' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(video.videoUrl, video.prompt);
                                    }}
                                  >
                                    <Download className={video.isClip ? "w-3 h-3" : "w-4 h-4"} />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm ${video.isClip ? 'h-7 w-7 p-0' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFullscreen(video.id);
                                    }}
                                  >
                                    <Maximize className={video.isClip ? "w-3 h-3" : "w-4 h-4"} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VideoTimeline;