
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

const AspectRatio = () => {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-sans text-xs font-semibold text-primary">
        Aspect Ratio
      </Label>
      <div className="flex items-center gap-2">
        <Button
          variant={isLocked ? "default" : "outline"}
          size="sm"
          onClick={() => setIsLocked(!isLocked)}
          className="flex items-center gap-1"
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          {isLocked ? "Locked" : "Unlocked"}
        </Button>
      </div>
      <Separator />
    </div>
  );
};

export default AspectRatio;
