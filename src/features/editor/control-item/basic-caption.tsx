import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONTS } from "@/features/editor/data/fonts";
import { Font } from "@/features/editor/types/types";
import { Text } from "./common/text";

export default function BasicCaption() {
  const [text, setText] = useState("Basic Caption");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState<Font | null>(FONTS[0]);
  const fonts = FONTS;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontColor(e.target.value);
  };

  const handleChangeFontFamily = (font: Font) => {
    setSelectedFont(font);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="text">Text</Label>
        <Input id="text" value={text} onChange={handleTextChange} />
      </div>
      <div>
        <Label htmlFor="font-size">Font Size</Label>
        <Slider
          id="font-size"
          defaultValue={[fontSize]}
          max={100}
          step={1}
          onValueChange={handleFontSizeChange}
        />
      </div>
      <div>
        <Label htmlFor="font-color">Font Color</Label>
        <Input id="font-color" type="color" value={fontColor} onChange={handleFontColorChange} />
      </div>
      
      <Text
        fonts={fonts}
        selectedFont={selectedFont}
        onFontFamilySelect={handleChangeFontFamily}
      />
      
    </div>
  );
}
