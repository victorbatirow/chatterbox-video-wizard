import { useEffect, useRef, useState } from "react";
import Header from "./header";
import Ruler from "./ruler";
import { timeMsToUnits, unitsToTimeMs } from "@designcombo/timeline";
import CanvasTimeline from "./items/timeline";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { dispatch, filter, subject } from "@designcombo/events";
import {
  TIMELINE_BOUNDING_CHANGED,
  TIMELINE_PREFIX,
} from "@designcombo/timeline";
import useStore from "../store/use-store";
import Playhead from "./playhead";
import { useCurrentPlayerFrame } from "../hooks/use-current-frame";
import { Audio, Image, Text, Video, Caption, Helper, Track } from "./items";
import StateManager, { REPLACE_MEDIA } from "@designcombo/state";
import {
  TIMELINE_OFFSET_CANVAS_LEFT,
  TIMELINE_OFFSET_CANVAS_RIGHT,
} from "../constants/constants";
import { ITrackItem } from "@designcombo/types";
import PreviewTrackItem from "./items/preview-drag-item";

CanvasTimeline.registerItems({
  Text,
  Image,
  Audio,
  Video,
  Caption,
  Helper,
  Track,
  PreviewTrackItem,
});

const EMPTY_SIZE = { width: 0, height: 0 };
const Timeline = ({ stateManager }: { stateManager: StateManager }) => {
  // prevent duplicate scroll events
  const canScrollRef = useRef(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<CanvasTimeline | null>(null);
  const verticalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const { scale, playerRef, fps, duration, setState, timeline, trackItemIds } = useStore();
  const currentFrame = useCurrentPlayerFrame(playerRef!);
  const [canvasSize, setCanvasSize] = useState(EMPTY_SIZE);
  const [size, setSize] = useState<{ width: number; height: number }>(
    EMPTY_SIZE,
  );

  const { setTimeline } = useStore();
  const onScroll = (v: { scrollTop: number; scrollLeft: number }) => {
    if (horizontalScrollbarVpRef.current && verticalScrollbarVpRef.current) {
      verticalScrollbarVpRef.current.scrollTop = -v.scrollTop;
      horizontalScrollbarVpRef.current.scrollLeft = -v.scrollLeft;
      setScrollLeft(-v.scrollLeft);
    }
  };

  useEffect(() => {
    if (playerRef?.current) {
      canScrollRef.current = playerRef?.current.isPlaying();
    }
  }, [playerRef?.current?.isPlaying()]);

  useEffect(() => {
    const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom);
    const canvasBoudingX =
      canvasElRef.current?.getBoundingClientRect().x! +
      canvasElRef.current?.clientWidth!;
    const playHeadPos = position - scrollLeft + 40;
    if (playHeadPos >= canvasBoudingX) {
      const scrollDivWidth = horizontalScrollbarVpRef.current?.clientWidth!;
      const totalScrollWidth = horizontalScrollbarVpRef.current?.scrollWidth!;
      const currentPosScroll = horizontalScrollbarVpRef.current?.scrollLeft!;
      const availableScroll =
        totalScrollWidth - (scrollDivWidth + currentPosScroll);
      const scaleScroll = availableScroll / scrollDivWidth;
      if (scaleScroll >= 0) {
        if (scaleScroll > 1)
          horizontalScrollbarVpRef.current?.scrollTo({
            left: currentPosScroll + scrollDivWidth,
          });
        else
          horizontalScrollbarVpRef.current?.scrollTo({
            left: totalScrollWidth - scrollDivWidth,
          });
      }
    }
  }, [currentFrame]);

  const onResizeCanvas = (payload: { width: number; height: number }) => {
    setCanvasSize({
      width: payload.width,
      height: payload.height,
    });
  };

  const updateTimelineSize = () => {
    const canvasEl = canvasElRef.current;
    const timelineContainerEl = timelineContainerRef.current;

    if (!canvasEl || !timelineContainerEl || !canvasRef.current) return;

    const containerWidth = timelineContainerEl.clientWidth - 40;
    const containerHeight = timelineContainerEl.clientHeight - 90;

    // Update canvas size
    setCanvasSize({ width: containerWidth, height: containerHeight });
    
    // Calculate proper bounding width based on content or minimum canvas width
    const hasContent = trackItemIds && trackItemIds.length > 0;
    const boundingWidth = hasContent ? Math.max(containerWidth, size.width) : containerWidth;
    
    // Resize the timeline canvas with proper bounding
    canvasRef.current.resize(
      {
        width: containerWidth,
        height: containerHeight,
      },
      {
        force: true,
      },
    );

    // Update the bounding separately to ensure proper scroll calculation
    canvasRef.current.setBounding({
      width: boundingWidth,
      height: containerHeight,
    });
  };

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const timelineContainerEl = timelineContainerRef.current;

    if (!canvasEl || !timelineContainerEl) return;

    const containerWidth = timelineContainerEl.clientWidth - 40;
    const containerHeight = timelineContainerEl.clientHeight - 90;

    // First, ensure the state has the main track before creating the canvas
    const currentState = stateManager.getState();
    
    // Initialize state with proper structure if missing
    if (!currentState.tracks) {
      currentState.tracks = [];
    }
    if (!currentState.trackItemsMap) {
      currentState.trackItemsMap = {};
    }
    if (!currentState.trackItemIds) {
      currentState.trackItemIds = [];
    }
    if (!currentState.trackItemDetailsMap) {
      currentState.trackItemDetailsMap = {};
    }
    
    // Ensure main track exists
    if (!currentState.tracks.find(track => track.id === "main")) {
      currentState.tracks.push({
        id: "main",
        type: "main" as const,
        name: "Main Track",
        locked: false,
        visible: true,
        height: 80,
      });
    }
    
    const canvas = new CanvasTimeline(canvasEl, {
      width: containerWidth,
      height: containerHeight,
      bounding: {
        width: containerWidth,
        height: 120,
      },
      selectionColor: "rgba(0, 216, 214,0.1)",
      selectionBorderColor: "rgba(0, 216, 214,1.0)",
      onScroll,
      onResizeCanvas,
      scale: scale,
      state: stateManager,
      duration,
      spacing: {
        left: TIMELINE_OFFSET_CANVAS_LEFT,
        right: TIMELINE_OFFSET_CANVAS_RIGHT,
      },
      sizesMap: {
        main: 80,
      },
      acceptsMap: {
        main: ["video"],
      },
      guideLineColor: "#ffffff",
    });

    canvasRef.current = canvas;

    // Sync the initial state with the store
    setState({
      tracks: currentState.tracks,
      trackItemsMap: currentState.trackItemsMap || {},
      trackItemIds: currentState.trackItemIds || [],
      trackItemDetailsMap: currentState.trackItemDetailsMap || {},
    });

    setCanvasSize({ width: containerWidth, height: containerHeight });
    setSize({
      width: containerWidth,
      height: 120,
    });
    setTimeline(canvas);

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateTimelineSize();
    });

    if (timelineContainerEl) {
      resizeObserver.observe(timelineContainerEl);
    }

    const resizeDesignSubscription = stateManager.subscribeToSize(
      (newState) => {
        setState(newState);
      },
    );
    const scaleSubscription = stateManager.subscribeToScale((newState) => {
      setState(newState);
    });

    const tracksSubscription = stateManager.subscribeToState((newState) => {
      setState(newState);
    });
    const durationSubscription = stateManager.subscribeToDuration(
      (newState) => {
        setState(newState);
      },
    );

    const updateTrackItemsMap = stateManager.subscribeToUpdateTrackItem(() => {
      const currentState = stateManager.getState();
      setState({
        duration: currentState.duration,
        trackItemsMap: currentState.trackItemsMap || {},
      });
    });

    const itemsDetailsSubscription = stateManager.subscribeToAddOrRemoveItems(
      () => {
        const currentState = stateManager.getState();
        setState({
          trackItemDetailsMap: currentState.trackItemDetailsMap || {},
          trackItemsMap: currentState.trackItemsMap || {},
          trackItemIds: currentState.trackItemIds || [],
          tracks: currentState.tracks || [],
        });
      },
    );

    const updateItemDetailsSubscription =
      stateManager.subscribeToUpdateItemDetails(() => {
        const currentState = stateManager.getState();
        setState({
          trackItemDetailsMap: currentState.trackItemDetailsMap || {},
        });
      });

    return () => {
      canvas.purge();
      resizeObserver.disconnect();
      scaleSubscription.unsubscribe();
      tracksSubscription.unsubscribe();
      durationSubscription.unsubscribe();
      itemsDetailsSubscription.unsubscribe();
      updateTrackItemsMap.unsubscribe();
      updateItemDetailsSubscription.unsubscribe();
      resizeDesignSubscription.unsubscribe();
    };
  }, []);

  const handleOnScrollH = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    
    // Check if there's actual content that needs scrolling
    const hasContent = trackItemIds && trackItemIds.length > 0;
    const contentWidth = hasContent ? Math.max(size.width + TIMELINE_OFFSET_CANVAS_RIGHT, canvasSize.width) : canvasSize.width;
    
    // Only allow scrolling if content is wider than canvas
    if (contentWidth <= canvasSize.width) {
      e.currentTarget.scrollLeft = 0;
      setScrollLeft(0);
      return;
    }
    
    // Calculate max scroll based on actual content width
    const maxScrollLeft = Math.max(0, contentWidth - canvasSize.width);
    const constrainedScrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft));
    
    if (constrainedScrollLeft !== scrollLeft) {
      e.currentTarget.scrollLeft = constrainedScrollLeft;
      return;
    }
    
    if (canScrollRef.current && canvasRef.current) {
      canvasRef.current.scrollTo({ scrollLeft: constrainedScrollLeft });
    }
    setScrollLeft(constrainedScrollLeft);
  };

  const handleOnScrollV = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (canScrollRef.current) {
      const canvas = canvasRef.current!;
      canvas.scrollTo({ scrollTop });
    }
  };

  // Enhanced mouse wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Only allow horizontal scrolling if there's content that overflows
    if (timelineContentWidth <= canvasSize.width) {
      return;
    }

    // Check if shift is held or if it's a horizontal scroll
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      e.stopPropagation();
      
      const scrollAmount = e.deltaX || e.deltaY;
      const currentScrollLeft = horizontalScrollbarVpRef.current?.scrollLeft || 0;
      
      // Calculate max scroll based on actual content width
      const maxScrollLeft = Math.max(0, timelineContentWidth - canvasSize.width);
      const newScrollLeft = Math.max(0, Math.min(currentScrollLeft + scrollAmount, maxScrollLeft));
      
      if (horizontalScrollbarVpRef.current) {
        horizontalScrollbarVpRef.current.scrollLeft = newScrollLeft;
        setScrollLeft(newScrollLeft);
        if (canvasRef.current) {
          canvasRef.current.scrollTo({ scrollLeft: newScrollLeft });
        }
      }
    }
  };

  useEffect(() => {
    const addEvents = subject.pipe(
      filter(({ key }) => key.startsWith(TIMELINE_PREFIX)),
    );

    const subscription = addEvents.subscribe((obj) => {
      if (obj.key === TIMELINE_BOUNDING_CHANGED) {
        const bounding = obj.value?.payload?.bounding;
        if (bounding) {
          setSize({
            width: bounding.width,
            height: bounding.height,
          });
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleReplaceItem = (trackItem: Partial<ITrackItem>) => {
    dispatch(REPLACE_MEDIA, {
      payload: {
        [trackItem.id!]: {
          details: {
            src: "https://cdn.designcombo.dev/videos/demo-video-4.mp4",
          },
        },
      },
    });
  };

  const onClickRuler = (units: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const time = unitsToTimeMs(units, scale.zoom);
    playerRef?.current?.seekTo((time * fps) / 1000);
  };

  useEffect(() => {
    const availableScroll = horizontalScrollbarVpRef.current?.scrollWidth;
    if (!availableScroll || !timeline) return;
    const canvasWidth = timeline.width;
    if (availableScroll < canvasWidth + scrollLeft) {
      timeline.scrollTo({ scrollLeft: availableScroll - canvasWidth });
    }
  }, [scale]);

  // Calculate the actual timeline content width based on actual content
  const getTimelineContentWidth = () => {
    // If there are no track items, return the canvas width (no scrolling needed)
    if (!trackItemIds || trackItemIds.length === 0) {
      return canvasSize.width;
    }
    
    // If there's actual content, use the calculated size with some padding
    const contentWidth = Math.max(
      size.width + TIMELINE_OFFSET_CANVAS_RIGHT,
      canvasSize.width
    );
    
    return contentWidth;
  };

  const timelineContentWidth = getTimelineContentWidth();

  return (
    <div
      ref={timelineContainerRef}
      id={"timeline-container"}
      className="relative h-full w-full overflow-hidden bg-sidebar"
      onWheel={handleWheel}
    >
      <Header />
      <Ruler onClick={onClickRuler} scrollLeft={scrollLeft} />
      <Playhead scrollLeft={scrollLeft} />
      <div className="flex">
        <div className="relative w-10 flex-none"></div>
        <div style={{ height: canvasSize.height }} className="relative flex-1">
          <div
            style={{ height: canvasSize.height }}
            ref={containerRef}
            className="absolute top-0 w-full"
          >
            <canvas id="designcombo-timeline-canvas" ref={canvasElRef} />
          </div>
          
          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              width: `${canvasSize.width}px`,
              height: "12px",
              bottom: "0px",
              left: "0px",
            }}
            className="ScrollAreaRootH overflow-hidden"
            onPointerDown={() => {
              canScrollRef.current = true;
            }}
            onPointerUp={() => {
              canScrollRef.current = false;
            }}
          >
            <ScrollArea.Viewport
              onScroll={handleOnScrollH}
              className="ScrollAreaViewport overflow-hidden"
              id="viewportH"
              ref={horizontalScrollbarVpRef}
              style={{ height: "12px", width: `${canvasSize.width}px` }}
            >
              <div
                style={{
                  width: timelineContentWidth,
                  height: "12px",
                }}
                className="pointer-events-none"
              ></div>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className="ScrollAreaScrollbar bg-transparent hover:bg-transparent transition-colors h-3 overflow-hidden"
              orientation="horizontal"
            >
              <ScrollArea.Thumb
                onMouseDown={() => {
                  canScrollRef.current = true;
                }}
                onMouseUp={() => {
                  canScrollRef.current = false;
                }}
                className="ScrollAreaThumb bg-border/50 hover:bg-border/70 transition-colors rounded-sm"
              />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              height: canvasSize.height,
              width: "12px",
              right: "0px",
            }}
            className="ScrollAreaRootV overflow-hidden"
          >
            <ScrollArea.Viewport
              onScroll={handleOnScrollV}
              className="ScrollAreaViewport overflow-hidden"
              ref={verticalScrollbarVpRef}
              style={{ width: "12px", height: `${canvasSize.height}px` }}
            >
              <div
                style={{
                  height:
                    size.height > canvasSize.height
                      ? size.height + 40
                      : canvasSize.height,
                  width: "12px",
                }}
                className="pointer-events-none"
              ></div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="ScrollAreaScrollbar bg-transparent hover:bg-transparent transition-colors w-3 overflow-hidden"
              orientation="vertical"
            >
              <ScrollArea.Thumb
                onMouseDown={() => {
                  canScrollRef.current = true;
                }}
                onMouseUp={() => {
                  canScrollRef.current = false;
                }}
                className="ScrollAreaThumb bg-border/50 hover:bg-border/70 transition-colors rounded-sm"
              />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
