import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ITrackItem } from "@designcombo/types";
import { useEffect, useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";

const AspectRatio = ({ trackItem }: { trackItem: ITrackItem }) => {
  const [aspectRatio, setAspectRatio] = useState({
    width: trackItem.details.width,
    height: trackItem.details.height,
  });

  useEffect(() => {
    setAspectRatio({
      width: trackItem.details.width,
      height: trackItem.details.height,
    });
  }, [trackItem.details.width, trackItem.details.height]);

  const handleChangeWidth = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            width: v,
          },
        },
      },
    });
    setAspectRatio((prev) => ({ ...prev, width: v }));
  };

  const handleChangeHeight = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            height: v,
          },
        },
      },
    });
    setAspectRatio((prev) => ({ ...prev, height: v }));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="width">Width</Label>
        <Input
          variant="outline"
          value={aspectRatio.width}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              handleChangeWidth(value);
            }
          }}
          type="number"
          id="width"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="height">Height</Label>
        <Input
          variant="outline"
          value={aspectRatio.height}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              handleChangeHeight(value);
            }
          }}
          type="number"
          id="height"
        />
      </div>
    </div>
  );
};

export default AspectRatio;
