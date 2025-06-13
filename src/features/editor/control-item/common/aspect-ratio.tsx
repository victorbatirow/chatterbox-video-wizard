
import { Button } from "@/components/ui/button";
import { AspectRatio as AspectRatioType } from "@/constants/aspect-ratios";

interface AspectRatioProps {
  aspectRatio: AspectRatioType;
  setAspectRatio: (ratio: AspectRatioType) => void;
  ratios: AspectRatioType[];
}

const AspectRatio = ({
  aspectRatio,
  setAspectRatio,
  ratios,
}: AspectRatioProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {ratios.map((ratio) => (
        <Button
          key={ratio}
          onClick={() => setAspectRatio(ratio)}
          variant={aspectRatio === ratio ? "default" : "outline"}
          size="sm"
          className="flex items-center space-x-2"
        >
          {ratio}
        </Button>
      ))}
    </div>
  );
};

export default AspectRatio;
