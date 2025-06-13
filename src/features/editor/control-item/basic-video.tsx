import AspectRatio from "@/features/editor/control-item/common/aspect-ratio";
import { AspectRatio as AspectRatioType } from "@/constants/aspect-ratios";
import { useState } from "react";

export default function BasicVideo() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");

  return (
    <div className="flex flex-col gap-4">
      <AspectRatio
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        ratios={["16:9", "9:16", "1:1", "4:3", "3:4"]}
      />
    </div>
  );
}
