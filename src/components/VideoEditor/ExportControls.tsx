import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Settings, Video, CheckCircle, Loader2 } from 'lucide-react';
import { VideoClip, ExportSettings } from './types';
import { getTotalDuration, formatTime } from './utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportControlsProps {
  clips: VideoClip[];
  onExport: (clips: VideoClip[], settings: ExportSettings) => void;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  clips,
  onExport,
  className = ""
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p'
  });

  const totalDuration = getTotalDuration(clips);
  const canExport = clips.length > 0 && !isExporting;

  const handleExport = async () => {
    if (!canExport) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      await onExport(clips, exportSettings);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Reset after a delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className={`bg-gray-900/50 rounded-lg border border-white/10 ${className}`}>
      {/* Export Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Video className="w-5 h-5" />
              Export Video
            </h3>
            <p className="text-sm text-white/60">
              Combine {clips.length} clip{clips.length !== 1 ? 's' : ''} into a single video
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsToggle}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Export Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Format</label>
                <div className="flex gap-2">
                  {(['mp4', 'webm', 'avi'] as const).map(format => (
                    <Button
                      key={format}
                      variant={exportSettings.format === format ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setExportSettings(prev => ({ ...prev, format }))}
                      className="text-xs"
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Quality</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(quality => (
                    <Button
                      key={quality}
                      variant={exportSettings.quality === quality ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setExportSettings(prev => ({ ...prev, quality }))}
                      className="text-xs capitalize"
                    >
                      {quality}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resolution Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Resolution</label>
                <div className="flex gap-2">
                  {(['720p', '1080p', '4k'] as const).map(resolution => (
                    <Button
                      key={resolution}
                      variant={exportSettings.resolution === resolution ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setExportSettings(prev => ({ ...prev, resolution }))}
                      className="text-xs"
                    >
                      {resolution}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Info */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/60">Total Duration</div>
            <div className="text-white font-medium">{formatTime(totalDuration)}</div>
          </div>
          <div>
            <div className="text-white/60">Output Format</div>
            <div className="text-white font-medium">
              {exportSettings.format.toUpperCase()} • {exportSettings.quality} • {exportSettings.resolution}
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {exportProgress >= 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                )}
                <span className="text-white font-medium">
                  {exportProgress >= 100 ? 'Export Complete!' : 'Exporting...'}
                </span>
                <span className="text-white/60 ml-auto">
                  {Math.round(exportProgress)}%
                </span>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {exportProgress < 100 && (
                <p className="text-xs text-white/60 mt-2">
                  Processing {clips.length} video clips...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Button */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </>
          )}
        </Button>
        
        {!canExport && clips.length === 0 && (
          <p className="text-xs text-white/60 text-center mt-2">
            Add video clips to the timeline to export
          </p>
        )}
      </div>
    </div>
  );
}; 