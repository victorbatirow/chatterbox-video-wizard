
import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VIDEOS } from "../data/video";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import useVideoStore from "@/stores/use-video-store";
import { Separator } from "@/components/ui/separator";

export const Videos = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const { chatVideos } = useVideoStore();

  const handleAddVideo = (payload: Partial<IVideo>) => {
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
      </div>
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4">
          {/* Chat Generated Videos Section */}
          {chatVideos.length > 0 && (
            <>
              <div className="text-text-secondary text-xs font-medium mb-3 mt-2">
                Generated Videos
              </div>
              <div className="masonry-sm mb-4">
                {chatVideos.map((video) => (
                  <ChatVideoItem
                    key={video.id}
                    video={video}
                    shouldDisplayPreview={!isDraggingOverTimeline}
                    handleAddVideo={handleAddVideo}
                  />
                ))}
              </div>
              <Separator className="my-4" />
            </>
          )}

          {/* Default Videos Section */}
          <div className="text-text-secondary text-xs font-medium mb-3">
            Stock Videos
          </div>
          <div className="masonry-sm">
            {VIDEOS.map((video, index) => {
              return (
                <VideoItem
                  key={index}
                  video={video}
                  shouldDisplayPreview={!isDraggingOverTimeline}
                  handleAddImage={handleAddVideo}
                />
              );
            })}
          </div>
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

  return (
    <Draggable
      data={{
        details: {
          src: video.videoUrl,
        },
        metadata: {
          previewUrl: video.preview,
          prompt: video.prompt,
        },
      }}
      renderCustomPreview={<div style={style} className="draggable" />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
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
        className="flex w-full flex-col items-center justify-center overflow-hidden bg-background pb-2"
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

const VideoItem = ({
  handleAddImage,
  video,
  shouldDisplayPreview,
}: {
  handleAddImage: (payload: Partial<IVideo>) => void;
  video: Partial<IVideo>;
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

  return (
    <Draggable
      data={{
        ...video,
        metadata: {
          previewUrl: video.preview,
        },
      }}
      renderCustomPreview={<div style={style} className="draggable" />}
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onClick={() =>
          handleAddImage({
            id: generateId(),
            details: {
              src: video.details!.src,
            },
            metadata: {
              previewUrl: video.preview,
            },
          } as any)
        }
        className="flex w-full items-center justify-center overflow-hidden bg-background pb-2"
      >
        <img
          draggable={false}
          src={video.preview}
          className="h-full w-full rounded-md object-cover"
          alt="image"
        />
      </div>
    </Draggable>
  );
};
