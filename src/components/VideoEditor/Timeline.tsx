import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VideoClip } from './types';
import { formatTime, getTotalDuration, trimClip, getEffectiveDuration, calculateClipStartTimes, updateClipAfterTrim, getTimelineDuration } from './utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Scissors, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  clips: VideoClip[];
  currentTime: number;
  isPlaying: boolean;
  onClipsChange: (clips: VideoClip[]) => void;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
  className?: string;
}

interface TrimOperation {
  clipId: string;
  type: 'start' | 'end';
  initialMouseX: number;
  initialClipLeft: number;
  initialClipWidth: number;
  initialTrimStart: number;
  initialTrimEnd: number;
}

interface DragState {
  draggedClip: VideoClip | null;
  draggedIndex: number;
  currentMouseX: number;
  insertionIndex: number;
  isDragging: boolean;
}

interface ClipPosition {
  id: string;
  index: number;
  left: number;
  width: number;
  clip: VideoClip;
  isInNewPosition?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  currentTime,
  isPlaying,
  onClipsChange,
  onTimeUpdate,
  onPlayPause,
  className = ""
}) => {
  const [scale, setScale] = useState(1);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [trimOperation, setTrimOperation] = useState<TrimOperation | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggedClip: null,
    draggedIndex: -1,
    currentMouseX: 0,
    insertionIndex: -1,
    isDragging: false
  });
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastTrimUpdateRef = useRef<number>(0);
  const dragElementRef = useRef<HTMLDivElement>(null);

  // Calculate timeline duration (including gaps)
  const timelineDuration = useMemo(() => getTimelineDuration(clips), [clips]);
  
  // Minimum timeline width to show empty space
  const minTimelineWidth = Math.max(timelineDuration, 60); // At least 60 seconds visible

  // Calculate clip positions for drag preview
  const getClipPositions = useCallback((): ClipPosition[] => {
    return clips.map((clip, index) => {
      const startPercentage = minTimelineWidth > 0 ? ((clip.startTime || 0) / minTimelineWidth) * 100 : 0;
      const widthPercentage = minTimelineWidth > 0 ? (getEffectiveDuration(clip) / minTimelineWidth) * 100 : 0;
      return { 
        id: clip.id,
        index,
        left: startPercentage, 
        width: widthPercentage,
        clip 
      };
    });
  }, [clips, minTimelineWidth]);

  // Calculate insertion index based on mouse position
  const calculateInsertionIndex = useCallback((mouseX: number) => {
    if (!timelineRef.current || clips.length === 0) return 0;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const relativeX = mouseX - timelineRect.left;
    const percentage = relativeX / timelineRect.width;
    const timePosition = percentage * minTimelineWidth;
    
    // Find where this time position would fall in the sequence
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipEnd = (clip.startTime || 0) + getEffectiveDuration(clip);
      if (timePosition <= clipEnd) {
        return i;
      }
    }
    
    return clips.length;
  }, [clips, minTimelineWidth]);

  // Preview clip arrangement during drag or trim
  const getPreviewArrangement = useMemo((): ClipPosition[] => {
    // Handle trim operations specially
    if (trimOperation) {
      const trimmedClipIndex = clips.findIndex(c => c.id === trimOperation.clipId);
      const trimmedClip = clips[trimmedClipIndex];
      
      if (trimmedClip && trimOperation.type === 'start') {
        // When trimming the left side, show clips moving together
        const originalStartTime = trimmedClip.startTime || 0;
        const currentTrimStart = trimmedClip.trimStart || 0;
        const newStartTime = originalStartTime + currentTrimStart;
        const timeDelta = newStartTime - originalStartTime;
        
        return clips.map((clip, index) => {
          let adjustedClip = { ...clip };
          
          // Move clips to the left of the trimmed clip
          if (index < trimmedClipIndex) {
            adjustedClip = {
              ...clip,
              startTime: (clip.startTime || 0) + timeDelta
            };
          }
          // Update the trimmed clip itself
          else if (index === trimmedClipIndex) {
            adjustedClip = {
              ...clip,
              startTime: newStartTime
            };
          }
          // Clips to the right stay unchanged - use original clip data
          
          const startPercentage = minTimelineWidth > 0 ? ((adjustedClip.startTime || 0) / minTimelineWidth) * 100 : 0;
          const widthPercentage = minTimelineWidth > 0 ? (getEffectiveDuration(adjustedClip) / minTimelineWidth) * 100 : 0;
          
          return {
            id: clip.id,
            index,
            left: startPercentage,
            width: widthPercentage,
            clip: adjustedClip,
            isInNewPosition: index <= trimmedClipIndex && timeDelta !== 0
          };
        });
      }
      
      // For right side trimming, use normal positioning
      return getClipPositions();
    }
    
    // Handle drag operations
    if (!dragState.isDragging || dragState.draggedIndex === -1) {
      return getClipPositions();
    }

    // Create a preview of how clips would be arranged
    const newClips = [...clips];
    const [draggedClip] = newClips.splice(dragState.draggedIndex, 1);
    newClips.splice(dragState.insertionIndex, 0, draggedClip);
    
    // Calculate sequential positions for the new arrangement
    const sequentialClips = calculateClipStartTimes(newClips);
    
    return sequentialClips.map((clip, index) => {
      const startPercentage = minTimelineWidth > 0 ? ((clip.startTime || 0) / minTimelineWidth) * 100 : 0;
      const widthPercentage = minTimelineWidth > 0 ? (getEffectiveDuration(clip) / minTimelineWidth) * 100 : 0;
      return { 
        id: clip.id,
        index,
        left: startPercentage, 
        width: widthPercentage,
        clip,
        isInNewPosition: clip.id !== clips[index]?.id
      };
    });
  }, [clips, dragState, minTimelineWidth, getClipPositions, trimOperation]);

  // Handle timeline click to seek
  const handleTimelineClick = useCallback((time: number) => {
    onTimeUpdate(Math.max(0, Math.min(time, timelineDuration)));
  }, [timelineDuration, onTimeUpdate]);

  // Handle clip selection
  const handleClipClick = useCallback((e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    if (dragState.isDragging) return; // Don't select during drag
    setSelectedClipId(prev => prev === clipId ? null : clipId);
  }, [dragState.isDragging]);

  // Clear selection when clicking timeline background
  const handleTimelineBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !dragState.isDragging) {
      setSelectedClipId(null);
    }
  }, [dragState.isDragging]);

  // Skip forward/backward
  const handleSkipForward = useCallback(() => {
    onTimeUpdate(Math.min(currentTime + 10, timelineDuration));
  }, [currentTime, timelineDuration, onTimeUpdate]);

  const handleSkipBackward = useCallback(() => {
    onTimeUpdate(Math.max(currentTime - 10, 0));
  }, [currentTime, onTimeUpdate]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.5, 0.2));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
  }, []);

  // Enhanced drag and drop handlers with smooth animations
  const handleDragStart = useCallback((e: React.DragEvent, clip: VideoClip) => {
    if (trimOperation) {
      e.preventDefault();
      return;
    }
    
    const draggedIndex = clips.findIndex(c => c.id === clip.id);
    setDragState({
      draggedClip: clip,
      draggedIndex,
      currentMouseX: e.clientX,
      insertionIndex: draggedIndex,
      isDragging: true
    });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    
    // Create a custom drag image
    if (dragElementRef.current) {
      e.dataTransfer.setDragImage(dragElementRef.current, 50, 25);
    }
  }, [trimOperation, clips]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragState.isDragging) return;
    
    const insertionIndex = calculateInsertionIndex(e.clientX);
    
    setDragState(prev => ({
      ...prev,
      currentMouseX: e.clientX,
      insertionIndex
    }));
  }, [dragState.isDragging, calculateInsertionIndex]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragState.draggedClip || dragState.draggedIndex === -1) return;

    // Only apply the change if the position actually changed
    if (dragState.draggedIndex !== dragState.insertionIndex) {
      const newClips = [...clips];
      const [movedClip] = newClips.splice(dragState.draggedIndex, 1);
      newClips.splice(dragState.insertionIndex, 0, movedClip);

      // Recalculate start times to make clips sequential
      const updatedClips = calculateClipStartTimes(newClips);
      onClipsChange(updatedClips);
    }

    setDragState({
      draggedClip: null,
      draggedIndex: -1,
      currentMouseX: 0,
      insertionIndex: -1,
      isDragging: false
    });
  }, [clips, dragState, onClipsChange]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedClip: null,
      draggedIndex: -1,
      currentMouseX: 0,
      insertionIndex: -1,
      isDragging: false
    });
  }, []);

  // Handle mouse move during drag (for better insertion index calculation)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging) {
      const insertionIndex = calculateInsertionIndex(e.clientX);
      setDragState(prev => ({
        ...prev,
        currentMouseX: e.clientX,
        insertionIndex
      }));
    }
  }, [dragState.isDragging, calculateInsertionIndex]);

  // Add mouse move listener during drag
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'grabbing';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.body.style.cursor = '';
      };
    }
  }, [dragState.isDragging, handleMouseMove]);

  // Get clip visual bounds for precise trimming
  const getClipBounds = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || !timelineRef.current) return null;

    // Simple bounds calculation - not used for coordinate conversion anymore
    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    return { 
      left: 0, 
      width: timelineRect.width, 
      timelineRect 
    };
  }, [clips]);

  // Trim handle mouse events with precise tracking
  const handleTrimStart = useCallback((e: React.MouseEvent, clip: VideoClip, type: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    
    const bounds = getClipBounds(clip.id);
    if (!bounds) return;
    
    setTrimOperation({
      clipId: clip.id,
      type,
      initialMouseX: e.clientX,
      initialClipLeft: bounds.left,
      initialClipWidth: bounds.width,
      initialTrimStart: clip.trimStart || 0,
      initialTrimEnd: clip.trimEnd || clip.originalDuration || clip.duration || 0
    });
  }, [getClipBounds]);

  const handleTrimMove = useCallback((e: MouseEvent) => {
    if (!trimOperation || !timelineRef.current) return;
    
    // Throttle updates to 60fps to prevent lag
    const now = performance.now();
    if (now - lastTrimUpdateRef.current < 16) return; // ~60fps
    lastTrimUpdateRef.current = now;
    
    const clip = clips.find(c => c.id === trimOperation.clipId);
    if (!clip) return;
    
    // Get the scrollable container (parent of timeline)
    const scrollContainer = timelineRef.current.parentElement;
    if (!scrollContainer) return;
    
    // Get container bounds and current scroll position
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollLeft = scrollContainer.scrollLeft;
    
    // Calculate mouse position relative to the scrollable container
    const mouseX = e.clientX;
    const relativeMouseX = mouseX - containerRect.left + scrollLeft;
    
    // Get the actual timeline width (the full canvas width)
    const timelineElement = timelineRef.current;
    const actualTimelineWidth = timelineElement.offsetWidth;
    
    // Convert pixel position to time
    const timelineTime = (relativeMouseX / actualTimelineWidth) * minTimelineWidth;
    
    const originalDuration = clip.originalDuration || clip.duration || 0;
    const clipStartTime = clip.startTime || 0;
    
    let newTrimStart = clip.trimStart || 0;
    let newTrimEnd = clip.trimEnd || originalDuration;
    
    if (trimOperation.type === 'start') {
      // For start trim: mouse position determines new start of visible content
      const desiredTrimStart = Math.max(0, timelineTime - clipStartTime);
      newTrimStart = Math.max(0, Math.min(desiredTrimStart, newTrimEnd - 0.1));
    } else {
      // For end trim: mouse position determines new end of visible content
      const desiredTrimEnd = Math.max(0, timelineTime - clipStartTime);
      newTrimEnd = Math.max(newTrimStart + 0.1, Math.min(desiredTrimEnd, originalDuration));
    }
    
    // Apply the trim
    const trimmedClip = trimClip(clip, newTrimStart, newTrimEnd);
    const updatedClips = clips.map(c => c.id === trimmedClip.id ? trimmedClip : c);
    
    // Different behavior based on trim type
    if (trimOperation.type === 'start') {
      // For left-side trimming: only update the trimmed clip during operation
      onClipsChange(updatedClips);
    } else {
      // For right-side trimming: keep clips to the right adjacent (sequential)
      const sequentialClips = calculateClipStartTimes(updatedClips);
      onClipsChange(sequentialClips);
    }
  }, [trimOperation, clips, minTimelineWidth, onClipsChange]);

  const handleTrimEnd = useCallback(() => {
    // Apply final positioning when trim ends
    if (trimOperation) {
      const trimmedClipIndex = clips.findIndex(c => c.id === trimOperation.clipId);
      
      if (trimOperation.type === 'start' && trimmedClipIndex !== -1) {
        // For left-side trimming: recalculate all clips to maintain sequential positioning
        const sequentialClips = calculateClipStartTimes(clips);
        onClipsChange(sequentialClips);
      }
    }
    
    setTrimOperation(null);
  }, [trimOperation, clips, onClipsChange]);

  // Mouse event listeners for trimming
  useEffect(() => {
    if (trimOperation) {
      // Set cursor style on body during trimming for better UX
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleTrimMove);
      document.addEventListener('mouseup', handleTrimEnd);
      
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleTrimMove);
        document.removeEventListener('mouseup', handleTrimEnd);
      };
    }
  }, [trimOperation, handleTrimMove, handleTrimEnd]);

  if (clips.length === 0) {
    return (
      <div className={`bg-gray-900/50 rounded-lg p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Timeline Empty</h3>
          <p className="text-white/60 text-sm">
            Start generating videos in the chat to see them appear here. 
            Once you have clips, you can click to select and trim them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Hidden drag image element */}
      <div 
        ref={dragElementRef}
        className="fixed -top-96 left-0 w-20 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center text-white text-xs pointer-events-none z-50"
      >
        Dragging...
      </div>

      {/* Timeline Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-850/50 border-b border-white/20 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Video Timeline</h3>
            <p className="text-sm text-white/60">
              {clips.length} clip{clips.length !== 1 ? 's' : ''} • {formatTime(timelineDuration)} timeline
              {selectedClipId && (
                <span className="text-purple-400 ml-2">• 1 clip selected</span>
              )}
              {dragState.isDragging && (
                <span className="text-blue-400 ml-2">• Reordering...</span>
              )}
            </p>
          </div>
          
          {/* Timeline Controls */}
          <div className="flex items-center gap-3 bg-black/20 rounded-lg p-2 backdrop-blur-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSkipBackward}
              className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white shadow-lg transition-all duration-200"
              disabled={dragState.isDragging}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onPlayPause}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 hover:scale-105 text-white shadow-lg transition-all duration-200"
              disabled={dragState.isDragging}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSkipForward}
              className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white shadow-lg transition-all duration-200"
              disabled={dragState.isDragging}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 backdrop-blur-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white text-xs px-2 transition-all duration-200"
                disabled={dragState.isDragging}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-white/80 font-mono min-w-[45px] text-center bg-black/30 rounded px-2 py-1">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white text-xs px-2 transition-all duration-200"
                disabled={dragState.isDragging}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomReset}
                className="bg-white/10 hover:bg-white/20 hover:scale-105 text-white text-xs px-2 transition-all duration-200"
                disabled={dragState.isDragging}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex items-center gap-6 text-sm">
          <div className="bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            <span className="text-white font-mono text-sm">{formatTime(currentTime)}</span>
            <span className="text-white/50 mx-1">/</span>
            <span className="text-white/70 font-mono text-sm">{formatTime(timelineDuration)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex-1 relative h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg"
              style={{
                width: `${timelineDuration > 0 ? (currentTime / timelineDuration) * 100 : 0}%`
              }}
              transition={{ duration: dragState.isDragging || trimOperation ? 0 : 0.1 }}
            />
            
            {/* Glow effect */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400/50 to-blue-400/50 rounded-full blur-sm"
              style={{
                width: `${timelineDuration > 0 ? (currentTime / timelineDuration) * 100 : 0}%`
              }}
              transition={{ duration: dragState.isDragging || trimOperation ? 0 : 0.1 }}
            />
            
            {/* Clickable overlay for seeking */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={(e) => {
                if (dragState.isDragging) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const seekTime = percentage * timelineDuration;
                handleTimelineClick(seekTime);
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Track - Enhanced with smooth drag animations */}
      <div className="relative" style={{ height: '120px' }}>
        <div className="absolute inset-0 p-4">
          <div className="text-xs text-white/60 mb-2 flex justify-between">
            <span>Track 1: Video</span>
            <span className="text-white/40">
              {dragState.isDragging ? 'Drag to reorder clips' : 'Timeline Canvas'}
            </span>
          </div>
          
          {/* Scrollable Timeline Track Container */}
          <div className="relative h-20 bg-gradient-to-b from-black/30 to-black/50 rounded-lg border border-white/20 overflow-x-auto overflow-y-hidden shadow-inner backdrop-blur-sm">
            <div 
              ref={timelineRef}
              className="relative h-full"
              style={{ 
                width: `${Math.max(100, scale * 100)}%`,
                minWidth: `${Math.max(800, minTimelineWidth * scale * 10)}px`
              }}
              onClick={handleTimelineBackgroundClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              
              {/* Timeline grid markers for visual reference */}
              {minTimelineWidth > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: Math.ceil(minTimelineWidth / 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-white/10"
                      style={{
                        left: `${(i * 5 / minTimelineWidth) * 100}%`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Drop zone indicators during drag */}
              {dragState.isDragging && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-1 bottom-1 w-1 bg-blue-400 rounded-full z-40 shadow-lg"
                    style={{
                      left: `${getPreviewArrangement.find((_, index) => index === dragState.insertionIndex)?.left || 0}%`,
                      transform: 'translateX(-2px)'
                    }}
                  >
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white" />
                  </motion.div>
                </AnimatePresence>
              )}
              
              {/* Clips with smooth reordering animations */}
              <div className="relative h-full">
                <AnimatePresence>
                  {getPreviewArrangement.map((clipData, renderIndex) => {
                    const { clip, left, width, isInNewPosition } = clipData;
                    const actualIndex = clips.findIndex(c => c.id === clip.id);
                    const isBeingDragged = dragState.draggedClip?.id === clip.id;
                    const isSelected = selectedClipId === clip.id;
                    const isBeingTrimmed = trimOperation?.clipId === clip.id;
                    
                    return (
                      <motion.div
                        key={clip.id}
                        layout={!dragState.isDragging} // Disable layout animation during drag for better performance
                        initial={false}
                        animate={trimOperation ? {
                          left: `${left}%`,
                          width: `${width}%`,
                          opacity: isBeingDragged ? 0.3 : 1,
                          scale: isBeingDragged ? 0.95 : 1,
                          zIndex: isBeingDragged ? 50 : (isBeingTrimmed ? 20 : (isSelected ? 15 : 10))
                        } : {
                          left: `${left}%`,
                          width: `${width}%`,
                          opacity: isBeingDragged ? 0.3 : 1,
                          scale: isBeingDragged ? 0.95 : 1,
                          zIndex: isBeingDragged ? 50 : (isBeingTrimmed ? 20 : (isSelected ? 15 : 10))
                        }}
                        transition={trimOperation ? {
                          duration: 0
                        } : {
                          type: "spring",
                          stiffness: dragState.isDragging ? 400 : 200,
                          damping: dragState.isDragging ? 25 : 20,
                          mass: 0.8
                        }}
                        className="absolute h-full"
                        draggable={!trimOperation && !isBeingDragged}
                        onDragStart={(e) => handleDragStart(e, clip)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleClipClick(e, clip.id)}
                      >
                        <motion.div
                          className={`h-full rounded-lg overflow-hidden relative backdrop-blur-sm ${
                            isSelected 
                              ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 border-2 border-white shadow-2xl shadow-purple-500/30 cursor-move' 
                              : 'bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 border border-white/30 hover:border-white/60 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer'
                          } ${
                            isInNewPosition ? 'ring-2 ring-blue-400/70 ring-offset-2 ring-offset-black/50' : ''
                          } ${
                            isBeingTrimmed ? '' : 'transition-all duration-300 ease-out'
                          }`}
                          animate={trimOperation ? false : undefined}
                          transition={trimOperation ? { duration: 0 } : undefined}
                        >
                          {/* Left Trim Handle - Only show when selected and not dragging */}
                          {isSelected && !dragState.isDragging && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-30 flex items-center justify-center hover:bg-white/20 transition-colors"
                              onMouseDown={(e) => handleTrimStart(e, clip, 'start')}
                              style={{
                                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                borderLeft: '2px solid #ffffff'
                              }}
                            >
                              <div className="w-0.5 h-3 bg-white rounded-full" />
                            </div>
                          )}

                          {/* Right Trim Handle - Only show when selected and not dragging */}
                          {isSelected && !dragState.isDragging && (
                            <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-30 flex items-center justify-center hover:bg-white/20 transition-colors"
                              onMouseDown={(e) => handleTrimStart(e, clip, 'end')}
                              style={{
                                background: 'linear-gradient(270deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 100%)',
                                borderRight: '2px solid #ffffff'
                              }}
                            >
                              <div className="w-0.5 h-3 bg-white rounded-full" />
                            </div>
                          )}

                          {/* Clip Content */}
                          <div className={`p-2 h-full flex flex-col justify-between relative z-10 ${isSelected ? 'px-4' : ''}`}>
                            <div className="text-xs text-white font-medium truncate">
                              {clip.prompt}
                            </div>
                            <div className="text-xs text-white/70 flex justify-between">
                              <span>{formatTime(getEffectiveDuration(clip))}</span>
                              {(clip.trimStart || clip.trimEnd !== clip.originalDuration) && (
                                <span className="text-yellow-400">✂</span>
                              )}
                            </div>
                          </div>

                          {/* Trimmed regions indicator */}
                          {clip.trimStart && clip.trimStart > 0 && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-black/60 border-r border-red-400"
                              style={{ 
                                width: `${((clip.trimStart) / (clip.originalDuration || clip.duration || 1)) * 100}%` 
                              }}
                            />
                          )}
                          
                          {clip.trimEnd && clip.trimEnd < (clip.originalDuration || clip.duration || 0) && (
                            <div 
                              className="absolute right-0 top-0 bottom-0 bg-black/60 border-l border-red-400"
                              style={{ 
                                width: `${((clip.originalDuration || clip.duration || 0) - clip.trimEnd) / (clip.originalDuration || clip.duration || 1) * 100}%` 
                              }}
                            />
                          )}

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 border-2 border-white rounded pointer-events-none" />
                          )}

                          {/* New position indicator during drag */}
                          {isInNewPosition && dragState.isDragging && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 border-2 border-blue-400 rounded pointer-events-none bg-blue-400/10"
                            />
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
              {/* Playhead */}
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 to-red-600 z-30 pointer-events-none shadow-lg"
                animate={{
                  left: `${minTimelineWidth > 0 ? (currentTime / minTimelineWidth) * 100 : 0}%`
                }}
                transition={{ duration: dragState.isDragging || trimOperation ? 0 : 0.1 }}
                style={{
                  transform: 'translateX(-1px)',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }}
              >
                <div className="absolute -top-3 -left-2.5 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-white shadow-xl" />
                <div className="absolute -bottom-1 -left-1.5 w-3 h-2 bg-gradient-to-br from-red-400 to-red-600 border border-white shadow-lg" 
                     style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline Footer */}
      <div className="bg-gradient-to-r from-gray-800/30 to-gray-850/30 border-t border-white/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/70 flex items-center gap-2">
            {dragState.isDragging ? (
              <span className="text-blue-400 flex items-center gap-2">
                <Move className="w-4 h-4" />
                Drag to position • Release to drop • Blue indicator shows drop position
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-400" />
                Click clips to select • Drag trim handles to resize • Drag clips to reorder
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-white/60">
            <span className="font-mono text-xs bg-black/30 px-2 py-1 rounded">Scale: {Math.round(scale * 100)}%</span>
            {trimOperation && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-400 flex items-center gap-1"
              >
                <Scissors className="w-3 h-3" />
                Trimming...
              </motion.span>
            )}
            {dragState.isDragging && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-400 flex items-center gap-1"
              >
                <Move className="w-3 h-3" />
                Position: {dragState.insertionIndex + 1}
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 