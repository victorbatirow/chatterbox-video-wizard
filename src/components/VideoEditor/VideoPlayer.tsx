import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { VideoClip, VideoPlayerState } from './types';
import { findClipAtTime, formatTime, getTotalDuration, getEffectiveDuration } from './utils';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  clips: VideoClip[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  clips,
  currentTime,
  onTimeUpdate,
  isPlaying: externalIsPlaying = false,
  onPlayingChange,
  onDurationChange,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null); // For preloading next clip
  const animationFrameRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    currentClip: null,
    volume: 100,
    isMuted: false
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalDuration = getTotalDuration(clips);
  const currentClip = findClipAtTime(clips, currentTime);

  // Find next clip for preloading
  const currentClipIndex = clips.findIndex(c => c.id === currentClip?.id);
  const nextClip = currentClipIndex >= 0 && currentClipIndex < clips.length - 1 
    ? clips[currentClipIndex + 1] 
    : null;

  // Preload next video
  useEffect(() => {
    if (nextClip && nextVideoRef.current) {
      nextVideoRef.current.src = nextClip.videoUrl;
      nextVideoRef.current.preload = 'metadata';
    }
  }, [nextClip]);

  // Update video source when clip changes
  useEffect(() => {
    if (!videoRef.current || !currentClip) return;

    const video = videoRef.current;
    
    // Only change source if it's a different clip
    if (playerState.currentClip?.id !== currentClip.id) {
      setIsTransitioning(true);
      isSeekingRef.current = true;
      
      const wasPlaying = externalIsPlaying;
      
      // Calculate time within the current clip (considering trim)
      const clipStartTime = currentClip.startTime || 0;
      const timeInClip = Math.max(0, currentTime - clipStartTime);
      const trimStart = currentClip.trimStart || 0;
      const videoTime = trimStart + timeInClip; // Add trim offset to the actual video time
      
      video.src = currentClip.videoUrl;
      video.currentTime = videoTime;
      
      const handleCanPlay = () => {
        setIsTransitioning(false);
        isSeekingRef.current = false;
        
        if (wasPlaying) {
          video.play().catch(console.error);
        }
        
        video.removeEventListener('canplay', handleCanPlay);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      setPlayerState(prev => ({
        ...prev,
        currentClip: currentClip
      }));
    } else if (currentClip && !isSeekingRef.current) {
      // Same clip, just update time (considering trim)
      const clipStartTime = currentClip.startTime || 0;
      const timeInClip = Math.max(0, currentTime - clipStartTime);
      const trimStart = currentClip.trimStart || 0;
      const videoTime = trimStart + timeInClip;
      
      if (Math.abs(video.currentTime - videoTime) > 0.5) {
        isSeekingRef.current = true;
        video.currentTime = videoTime;
        
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 100);
      }
    }
  }, [currentClip, currentTime, playerState.currentClip, externalIsPlaying]);

  // Smooth animation loop for timeline updates
  const updateTimeLoop = useCallback(() => {
    if (!externalIsPlaying || !currentClip || !videoRef.current || isSeekingRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const video = videoRef.current;
    const clipStartTime = currentClip.startTime || 0;
    const trimStart = currentClip.trimStart || 0;
    const trimEnd = currentClip.trimEnd || currentClip.originalDuration || currentClip.duration || 0;
    
    // Calculate current time in the timeline (not video time)
    const videoCurrentTime = video.currentTime;
    const timeInClip = Math.max(0, videoCurrentTime - trimStart);
    const newGlobalTime = clipStartTime + timeInClip;
    
    // Check if we've reached the trim end point
    if (videoCurrentTime >= trimEnd - 0.1) { // Small buffer to prevent timing issues
      const currentIndex = clips.findIndex(c => c.id === currentClip.id);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < clips.length) {
        // Move to next clip
        const nextClip = clips[nextIndex];
        const nextClipStartTime = nextClip.startTime || 0;
        onTimeUpdate(nextClipStartTime);
      } else {
        // Reached end of timeline
        onTimeUpdate(totalDuration);
        onPlayingChange?.(false);
        return;
      }
    } else {
      onTimeUpdate(newGlobalTime);
    }

    animationFrameRef.current = requestAnimationFrame(updateTimeLoop);
  }, [externalIsPlaying, currentClip, clips, onTimeUpdate, totalDuration, onPlayingChange]);

  // Start/stop animation loop
  useEffect(() => {
    if (externalIsPlaying && !isTransitioning) {
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateTimeLoop);
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [externalIsPlaying, isTransitioning, updateTimeLoop]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const newPlayingState = !externalIsPlaying;
    
    if (newPlayingState) {
      video.play().then(() => {
        onPlayingChange?.(true);
      }).catch(console.error);
    } else {
      video.pause();
      onPlayingChange?.(false);
    }
  }, [externalIsPlaying, onPlayingChange]);

  // Handle volume change
  const handleVolumeChange = useCallback((volume: number) => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    video.volume = volume / 100;
    video.muted = volume === 0;
    
    setPlayerState(prev => ({
      ...prev,
      volume,
      isMuted: volume === 0
    }));
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const newMuted = !playerState.isMuted;
    
    video.muted = newMuted;
    setPlayerState(prev => ({ ...prev, isMuted: newMuted }));
  }, [playerState.isMuted]);

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  }, []);

  // Handle restart
  const handleRestart = useCallback(() => {
    onTimeUpdate(0);
  }, [onTimeUpdate]);

  // Sync video play/pause state
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    if (externalIsPlaying && video.paused && !isTransitioning) {
      video.play().catch(console.error);
    } else if (!externalIsPlaying && !video.paused) {
      video.pause();
    }
  }, [externalIsPlaying, isTransitioning]);

  if (clips.length === 0) {
    return (
      <div className={`bg-black rounded-lg flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center text-white/60">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No video selected</p>
          <p className="text-sm">Add video clips to the timeline to start editing</p>
        </div>
      </div>
    );
  }

  if (!currentClip) {
    return (
      <div className={`bg-black rounded-lg flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center text-white/60">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Select a time on the timeline</p>
          <p className="text-sm">Click on the timeline to start playback</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Main Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            const video = videoRef.current;
            video.volume = playerState.volume / 100;
            video.muted = playerState.isMuted;
          }
        }}
      />

      {/* Hidden preload video for next clip */}
      <video
        ref={nextVideoRef}
        className="hidden"
        playsInline
        preload="metadata"
      />

      {/* Transition Loading Overlay */}
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-4 left-4 right-4">
          {/* Progress Info */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span className="truncate max-w-xs">{currentClip.prompt}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
            
            {/* Global timeline progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-100"
                style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
              />
            </div>
            
            {/* Current clip info */}
            <div className="text-xs text-white/50">
              Playing: Clip {currentClipIndex + 1} of {clips.length}
              {nextClip && ` • Next: ${nextClip.prompt.substring(0, 30)}...`}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayPause}
                disabled={isTransitioning}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm disabled:opacity-50"
              >
                {externalIsPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRestart}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMuteToggle}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2"
                >
                  {playerState.isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playerState.isMuted ? 0 : playerState.volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer 
                    [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none 
                    [&::-moz-range-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${playerState.isMuted ? 0 : playerState.volume}%, rgba(255,255,255,0.2) ${playerState.isMuted ? 0 : playerState.volume}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 