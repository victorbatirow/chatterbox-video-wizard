export interface VideoClip {
  id: string;
  videoUrl: string;
  prompt: string;
  timestamp: Date;
  messageId?: string;
  isClip?: boolean;
  clipIndex?: number;
  duration?: number;
  startTime?: number;
  // Trimming properties
  trimStart?: number; // Trim in point (seconds from video start)
  trimEnd?: number;   // Trim out point (seconds from video start)
  originalDuration?: number; // Original video duration before trimming
}

export interface TimelineData {
  clips: VideoClip[];
  totalDuration: number;
  currentTime: number;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  currentClip: VideoClip | null;
  volume: number;
  isMuted: boolean;
}

export interface TimelineAction {
  id: string;
  start: number;
  end: number;
  effectId: string;
  clipId: string;
}

export interface TimelineRow {
  id: string;
  actions: TimelineAction[];
}

export interface VideoEffect {
  id: string;
  name: string;
  clip: VideoClip;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'avi';
  quality: 'low' | 'medium' | 'high';
  resolution: '720p' | '1080p' | '4k';
} 