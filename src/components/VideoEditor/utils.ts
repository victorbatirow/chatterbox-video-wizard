import { VideoClip, TimelineAction, TimelineRow, VideoEffect } from './types';

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get video duration using a promise-based approach
 */
export const getVideoDuration = (videoUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = videoUrl;
  });
};

/**
 * Get the effective duration of a clip (considering trimming)
 */
export const getEffectiveDuration = (clip: VideoClip): number => {
  const trimStart = clip.trimStart || 0;
  const trimEnd = clip.trimEnd || clip.originalDuration || clip.duration || 0;
  return Math.max(0, trimEnd - trimStart);
};

/**
 * Get total duration of all clips (considering trimming)
 */
export const getTotalDuration = (clips: VideoClip[]): number => {
  return getTimelineDuration(clips);
};

/**
 * Apply trimming to a clip
 */
export const trimClip = (clip: VideoClip, trimStart: number, trimEnd: number): VideoClip => {
  const originalDuration = clip.originalDuration || clip.duration || 0;
  
  // Ensure trim points are within bounds
  const validTrimStart = Math.max(0, Math.min(trimStart, originalDuration));
  const validTrimEnd = Math.max(validTrimStart, Math.min(trimEnd, originalDuration));
  
  return {
    ...clip,
    trimStart: validTrimStart,
    trimEnd: validTrimEnd,
    originalDuration: clip.originalDuration || clip.duration || 0,
    duration: validTrimEnd - validTrimStart
  };
};

/**
 * Calculate cumulative start times for clips in sequence (considering trimming)
 * This is used for initial clip placement and reordering
 */
export const calculateClipStartTimes = (clips: VideoClip[]): VideoClip[] => {
  let currentTime = 0;
  
  return clips.map(clip => {
    const updatedClip = {
      ...clip,
      startTime: currentTime,
      duration: getEffectiveDuration(clip)
    };
    
    currentTime += getEffectiveDuration(clip);
    return updatedClip;
  });
};

/**
 * Update clip after trimming without affecting other clips' positions
 * This preserves gaps and doesn't force sequential layout
 */
export const updateClipAfterTrim = (clips: VideoClip[], updatedClip: VideoClip): VideoClip[] => {
  return clips.map(clip => {
    if (clip.id === updatedClip.id) {
      return {
        ...updatedClip,
        duration: getEffectiveDuration(updatedClip)
      };
    }
    return clip;
  });
};

/**
 * Get total timeline duration (including gaps between clips)
 */
export const getTimelineDuration = (clips: VideoClip[]): number => {
  if (clips.length === 0) return 0;
  
  let maxEndTime = 0;
  clips.forEach(clip => {
    const endTime = (clip.startTime || 0) + getEffectiveDuration(clip);
    maxEndTime = Math.max(maxEndTime, endTime);
  });
  
  return maxEndTime;
};

/**
 * Find which clip should be playing at a given time
 */
export const findClipAtTime = (clips: VideoClip[], time: number): VideoClip | null => {
  for (const clip of clips) {
    const startTime = clip.startTime || 0;
    const endTime = startTime + (clip.duration || 0);
    
    if (time >= startTime && time < endTime) {
      return clip;
    }
  }
  
  return null;
};

/**
 * Convert clips to timeline format for react-timeline-editor
 */
export const clipsToTimelineData = (clips: VideoClip[]): { rows: TimelineRow[]; effects: Record<string, VideoEffect> } => {
  const effects: Record<string, VideoEffect> = {};
  const actions: TimelineAction[] = [];
  
  let currentTime = 0;
  
  clips.forEach(clip => {
    const effectId = `effect_${clip.id}`;
    
    effects[effectId] = {
      id: effectId,
      name: clip.prompt,
      clip: clip
    };
    
    actions.push({
      id: `action_${clip.id}`,
      start: currentTime,
      end: currentTime + (clip.duration || 0),
      effectId: effectId,
      clipId: clip.id
    });
    
    currentTime += clip.duration || 0;
  });
  
  return {
    rows: [{
      id: 'video_track',
      actions: actions
    }],
    effects: effects
  };
};

/**
 * Convert timeline data back to clips array
 */
export const timelineDataToClips = (rows: TimelineRow[], effects: Record<string, VideoEffect>): VideoClip[] => {
  if (!rows.length) return [];
  
  const actions = rows[0].actions.sort((a, b) => a.start - b.start);
  
  return actions.map(action => {
    const effect = effects[action.effectId];
    return {
      ...effect.clip,
      startTime: action.start,
      duration: action.end - action.start
    };
  });
};

/**
 * Reorder clips and recalculate start times
 */
export const reorderClips = (clips: VideoClip[], fromIndex: number, toIndex: number): VideoClip[] => {
  const newClips = [...clips];
  const [movedClip] = newClips.splice(fromIndex, 1);
  newClips.splice(toIndex, 0, movedClip);
  
  return calculateClipStartTimes(newClips);
};

/**
 * Check if a video element has audio
 */
export const detectVideoAudio = (videoElement: HTMLVideoElement): boolean => {
  // Check for browser-specific audio detection properties
  if ('mozHasAudio' in videoElement) {
    return (videoElement as any).mozHasAudio;
  }
  
  if ('webkitAudioDecodedByteCount' in videoElement) {
    return (videoElement as any).webkitAudioDecodedByteCount > 0;
  }
  
  // Generic fallback: check if video element reports audio tracks
  if ('audioTracks' in videoElement && (videoElement as any).audioTracks) {
    return (videoElement as any).audioTracks.length > 0;
  }
  
  return false;
}; 