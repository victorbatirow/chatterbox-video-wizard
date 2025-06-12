import Editor from "@/features/editor";
import { useEffect } from "react";
import useDataState from "@/features/editor/store/use-data-state";
import { getCompactFontData } from "@/features/editor/utils/fonts";
import { FONTS } from "@/features/editor/data/fonts";

const VideoEditor = () => {
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  return (
    <div className="h-full w-full video-editor-container dark">
      <div className="h-full w-full bg-slate-900 text-white">
        <Editor />
      </div>
    </div>
  );
};

export default VideoEditor;