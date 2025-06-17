import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Timeline } from './Timeline';
import { ExportControls } from './ExportControls';
import { VideoClip, ExportSettings } from './types';
import { getVideoDuration, calculateClipStartTimes, getTotalDuration, getEffectiveDuration } from './utils';
import { VideoMessage } from '@/pages/Chat';
import { motion } from 'framer-motion';

interface VideoEditorProps {
  videos: VideoMessage[];
  currentVideoId: string | null;
  isGenerating: boolean;
  onVideoSelect: (videoId: string) => void;
  className?: string;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videos,
  currentVideoId,
  isGenerating,
  onVideoSelect,
  className = ""
}) => {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingDurations, setIsLoadingDurations] = useState(false);

  // Convert VideoMessage[] to VideoClip[] and load durations
  useEffect(() => {
    const convertVideosToClips = async () => {
      if (videos.length === 0) {
        setClips([]);
        return;
      }

      setIsLoadingDurations(true);
      
      try {
        const clipsWithDurations = await Promise.all(
          videos.map(async (video, index) => {
            let duration = 5; // Default duration
            
            try {
              duration = await getVideoDuration(video.videoUrl);
            } catch (error) {
              console.warn(`Failed to get duration for video ${video.id}:`, error);
            }
            
            return {
              id: video.id,
              videoUrl: video.videoUrl,
              prompt: video.prompt,
              timestamp: video.timestamp,
              messageId: video.messageId,
              isClip: video.isClip,
              clipIndex: video.clipIndex,
              duration: duration,
              originalDuration: duration,
              trimStart: 0,
              trimEnd: duration,
              startTime: 0 // Will be calculated by calculateClipStartTimes
            };
          })
        );

        // Calculate start times for sequential playback
        const clipsWithStartTimes = calculateClipStartTimes(clipsWithDurations);
        setClips(clipsWithStartTimes);
      } catch (error) {
        console.error('Error loading video durations:', error);
      } finally {
        setIsLoadingDurations(false);
      }
    };

    convertVideosToClips();
  }, [videos]);

  // Handle clip reordering
  const handleClipsChange = useCallback((newClips: VideoClip[]) => {
    setClips(newClips);
  }, []);

  // Handle time updates
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Sync playing state when currentTime changes to end of timeline
  useEffect(() => {
    const totalDuration = getTotalDuration(clips);
    if (currentTime >= totalDuration && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentTime, clips, isPlaying]);

  // Handle video export
  const handleExport = useCallback(async (clips: VideoClip[], settings: ExportSettings) => {
    // Prepare export data
    const exportData = {
      clips: clips.map(clip => ({
        id: clip.id,
        videoUrl: clip.videoUrl,
        startTime: clip.startTime || 0,
        duration: getEffectiveDuration(clip),
        trimStart: clip.trimStart || 0,
        trimEnd: clip.trimEnd || clip.originalDuration || clip.duration || 0,
        originalDuration: clip.originalDuration || clip.duration || 0,
        prompt: clip.prompt
      })),
      settings,
      totalDuration: getTotalDuration(clips)
    };

    console.log('Exporting video with data:', exportData);
    
    // Here you would typically send this data to your backend
    // For now, we'll just log it and simulate the export
    
    // TODO: Implement actual export functionality
    // This would involve sending the export data to your backend
    // where ffmpeg or similar would concatenate the videos with proper trimming
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate export time
    
    // For demo purposes, create a simple download link
    const exportFileName = `edited_video_${Date.now()}.${settings.format}`;
    console.log(`Video exported as: ${exportFileName}`);
    
    return exportFileName;
  }, []);

  // Find current video for selection highlighting
  const currentClipIndex = useMemo(() => {
    if (!currentVideoId) return -1;
    return clips.findIndex(clip => clip.id === currentVideoId);
  }, [clips, currentVideoId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Loading State */}
      {isLoadingDurations && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8 bg-gray-900/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Loading video durations...</span>
          </div>
        </motion.div>
      )}

      {/* Video Player Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer
            clips={clips}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            className="aspect-video"
          />
        </div>

        {/* Export Controls */}
        <div className="lg:col-span-1">
          <ExportControls
            clips={clips}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Timeline Section */}
      <Timeline
        clips={clips}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onClipsChange={handleClipsChange}
        onTimeUpdate={handleTimeUpdate}
        onPlayPause={handlePlayPause}
      />

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/50 rounded-lg p-4 border border-white/10"
        >
          <h4 className="text-white font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-white/60 space-y-1">
            <div>Total clips: {clips.length}</div>
            <div>Current time: {currentTime.toFixed(2)}s</div>
            <div>Is playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Selected video: {currentVideoId || 'None'}</div>
            <div>Is generating: {isGenerating ? 'Yes' : 'No'}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 