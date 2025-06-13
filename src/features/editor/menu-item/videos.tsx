
import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React, { useEffect, useRef } from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import useVideoStore from "@/stores/use-video-store";

export const Videos = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { chatVideos } = useVideoStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  console.log('Videos component: chatVideos from store', chatVideos);

  const handleAddVideo = (payload: Partial<IVideo>) => {
    console.log('Videos component: Adding video to timeline', payload);
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  // Listen for highlight events from chat messages
  useEffect(() => {
    const handleHighlightVideos = (event: CustomEvent<{ videoIds: string[] }>) => {
      const { videoIds } = event.detail;
      console.log('Received highlight event for videos:', videoIds);
      
      // Find the first video to scroll to
      if (videoIds.length > 0 && scrollAreaRef.current) {
        const firstVideoId = videoIds[0];
        const videoElement = document.querySelector(`[data-video-id="${firstVideoId}"]`);
        
        if (videoElement) {
          videoElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    };

    // Custom event listener for video highlighting
    window.addEventListener('highlightVideos', handleHighlightVideos as EventListener);
    
    return () => {
      window.removeEventListener('highlightVideos', handleHighlightVideos as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="px-4 pb-4">
          {/* Chat Generated Videos Section */}
          {chatVideos.length > 0 ? (
            <>
              <div className="text-text-secondary text-xs font-medium mb-3 mt-2">
                Generated Videos ({chatVideos.length})
              </div>
              <div className="masonry-sm">
                {chatVideos.map((video) => (
                  <ChatVideoItem
                    key={video.id}
                    video={video}
                    shouldDisplayPreview={!isDraggingOverTimeline}
                    handleAddVideo={handleAddVideo}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <div className="text-sm text-center">No videos generated yet</div>
              <div className="text-xs mt-1 text-center">Generate videos from chat to see them here</div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const ChatVideoItem = ({
  handleAddVideo,
  video,
  shouldDisplayPreview,
}: {
  handleAddVideo: (payload: Partial<IVideo>) => void;
  video: any;
  shouldDisplayPreview: boolean;
}) => {
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(${video.preview})`,
      backgroundSize: "cover",
      width: "80px",
      height: "80px",
    }),
    [video.preview],
  );

  // Structure the data similar to stock videos for proper drag and drop
  const dragData = React.useMemo(() => ({
    id: generateId(),
    type: "video",
    details: {
      src: video.videoUrl,
    },
    metadata: {
      previewUrl: video.preview,
      prompt: video.prompt,
    },
    preview: video.preview,
  }), [video]);

  return (
    <Draggable
      data={dragData}
      renderCustomPreview={<div style={style} className="draggable" />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        data-video-id={video.id}
        onClick={() =>
          handleAddVideo({
            id: generateId(),
            details: {
              src: video.videoUrl,
            },
            metadata: {
              previewUrl: video.preview,
              prompt: video.prompt,
            },
          } as any)
        }
        className="flex w-full flex-col items-center justify-center overflow-hidden bg-background pb-2 transition-all duration-300"
      >
        <video
          src={video.videoUrl}
          className="h-20 w-full rounded-md object-cover"
          muted
          playsInline
          onMouseEnter={(e) => {
            const target = e.target as HTMLVideoElement;
            target.currentTime = 1; // Show frame at 1 second for preview
          }}
        />
        <div className="mt-1 text-xs text-text-secondary text-center px-1 line-clamp-2">
          {video.prompt}
        </div>
      </div>
    </Draggable>
  );
};
