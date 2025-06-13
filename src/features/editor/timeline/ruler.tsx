
import { useCallback, useEffect, useRef, useState } from "react";

import {
  PREVIEW_FRAME_WIDTH,
  SECONDARY_FONT,
  SMALL_FONT_SIZE,
  TIMELINE_OFFSET_CANVAS_LEFT,
  TIMELINE_OFFSET_X,
} from "../constants/constants";
import { formatTimelineUnit } from "../utils/format";
import useStore from "../store/use-store";
import { debounce } from "lodash";

interface RulerProps {
  height?: number;
  longLineSize?: number;
  shortLineSize?: number;
  offsetX?: number;
  textOffsetY?: number;
  scrollPos?: number;
  textFormat?: (scale: number) => string;
  scrollLeft?: number;
  onClick?: (units: number) => void;
}

const Ruler = (props: RulerProps) => {
  const {
    height = 40,
    longLineSize = 8,
    shortLineSize = 10,
    offsetX = TIMELINE_OFFSET_X + TIMELINE_OFFSET_CANVAS_LEFT,
    textOffsetY = 17,
    textFormat = formatTimelineUnit,
    scrollLeft: scrollPos = 0,
    onClick,
  } = props;
  const { scale } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: height,
  });
  const [fontLoaded, setFontLoaded] = useState(false);

  // Ensure font is loaded before drawing
  useEffect(() => {
    const checkFont = async () => {
      try {
        // Try to load the font if not already loaded
        if (!document.fonts.check(`${SMALL_FONT_SIZE}px ${SECONDARY_FONT}`)) {
          await document.fonts.load(`${SMALL_FONT_SIZE}px ${SECONDARY_FONT}`);
        }
        setFontLoaded(true);
      } catch (error) {
        // If font loading fails, proceed anyway
        setFontLoaded(true);
      }
    };
    
    checkFont();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && fontLoaded) {
      const context = canvas.getContext("2d");
      setCanvasContext(context);
      resize(canvas, context);
    }
  }, [fontLoaded]);

  const resize = useCallback((
    canvas: HTMLCanvasElement | null,
    context: CanvasRenderingContext2D | null,
  ) => {
    if (!canvas || !context || !fontLoaded) return;

    const offsetParent = canvas.offsetParent as HTMLDivElement;
    const width = offsetParent?.offsetWidth ?? canvas.offsetWidth;
    const height = canvasSize.height;

    canvas.width = width;
    canvas.height = height;

    // Get the current scale from the store
    const currentScale = useStore.getState().scale;
    draw(context, scrollPos, width, height, currentScale);
    setCanvasSize({ width, height });
  }, [fontLoaded, canvasSize.height, scrollPos]);

  const handleResize = useCallback(() => {
    if (fontLoaded && canvasContext) {
      resize(canvasRef.current, canvasContext);
    }
  }, [resize, canvasContext, fontLoaded]);

  // Listen to both window resize and timeline container resize
  useEffect(() => {
    const resizeHandler = debounce(handleResize, 100);
    
    // Listen to window resize
    window.addEventListener("resize", resizeHandler);

    // Listen to timeline container resize using ResizeObserver
    const canvas = canvasRef.current;
    let resizeObserver: ResizeObserver | null = null;
    
    if (canvas) {
      const timelineContainer = document.getElementById("timeline-container");
      if (timelineContainer) {
        resizeObserver = new ResizeObserver(() => {
          resizeHandler();
        });
        resizeObserver.observe(timelineContainer);
      }
    }

    return () => {
      window.removeEventListener("resize", resizeHandler);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [handleResize]);

  // Effect for scale changes - redraw with new scale
  useEffect(() => {
    if (canvasContext && fontLoaded) {
      const canvas = canvasRef.current;
      if (canvas) {
        draw(canvasContext, scrollPos, canvas.width, canvas.height, scale);
      }
    }
  }, [canvasContext, scale, fontLoaded, scrollPos]);

  const draw = (
    context: CanvasRenderingContext2D,
    scrollPos: number,
    width: number,
    height: number,
    currentScale = scale,
  ) => {
    const zoom = currentScale.zoom;
    const unit = currentScale.unit;
    const segments = currentScale.segments;
    context.clearRect(0, 0, width, height);
    context.save();
    context.strokeStyle = "#71717a";
    context.fillStyle = "#71717a";
    context.lineWidth = 1;
    
    // Ensure font is properly set with fallback
    context.font = `${SMALL_FONT_SIZE}px ${SECONDARY_FONT}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    context.textBaseline = "top";

    context.translate(0.5, 0);
    context.beginPath();

    const zoomUnit = unit * zoom * PREVIEW_FRAME_WIDTH;
    const minRange = Math.floor(scrollPos / zoomUnit);
    const maxRange = Math.ceil((scrollPos + width) / zoomUnit);
    const length = maxRange - minRange;

    // Draw text before drawing the lines
    for (let i = 0; i <= length; ++i) {
      const value = i + minRange;

      if (value < 0) continue;

      const startValue = (value * zoomUnit) / zoom;
      const startPos = (startValue - scrollPos / zoom) * zoom;

      if (startPos < -zoomUnit || startPos >= width + zoomUnit) continue;
      const text = textFormat(startValue);

      // Calculate the textOffsetX value
      const textWidth = context.measureText(text).width;
      const textOffsetX = -textWidth / 2;

      // Adjust textOffsetY so it stays inside the canvas but above the lines
      context.fillText(text, startPos + textOffsetX + offsetX, textOffsetY);
    }

    // Draw long and short lines after the text
    for (let i = 0; i <= length; ++i) {
      const value = i + minRange;

      if (value < 0) continue;

      const startValue = value * zoomUnit;
      const startPos = startValue - scrollPos + offsetX;

      for (let j = 0; j < segments; ++j) {
        const pos = startPos + (j / segments) * zoomUnit;

        if (pos < 0 || pos >= width) continue;

        const lineSize = j % segments ? shortLineSize : longLineSize;

        // Set color based on line size
        if (lineSize === shortLineSize) {
          context.strokeStyle = "#52525b"; // Yellow for short lines
        } else {
          context.strokeStyle = "#18181b"; // Red for long lines
        }

        const origin = 18; // Increase the origin to start lines lower, below the text

        const [x1, y1] = [pos, origin];
        const [x2, y2] = [x1, y1 + lineSize];

        context.beginPath(); // Begin a new path for each line
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);

        // Set color based on line size
        if (lineSize === shortLineSize) {
          context.stroke(); // Draw the line
        }
      }
    }

    context.restore();
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get the bounding box of the canvas to calculate the relative click position
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // Calculate total x position, including scrollPos
    const totalX =
      clickX + scrollPos - TIMELINE_OFFSET_X - TIMELINE_OFFSET_CANVAS_LEFT;

    onClick?.(totalX);
    // Here you can handle the result as needed
  };

  return (
    <div
      className="border-t border-border"
      style={{
        position: "relative",
        width: "100%",
        height: `${canvasSize.height}px`,
      }}
    >
      <canvas
        onMouseUp={handleClick}
        ref={canvasRef}
        height={canvasSize.height}
      />
    </div>
  );
};

export default Ruler;
