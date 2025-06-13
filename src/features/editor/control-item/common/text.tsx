
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  SECONDARY_FONT,
  SMALL_FONT_SIZE,
} from "@/features/editor/constants/constants";
import { Font } from "@/features/editor/types/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface TextProps {
  fonts: Font[];
  selectedFont: Font | null;
  onFontFamilySelect: (font: Font) => void;
}

const Text = (props: TextProps) => {
  const { fonts, selectedFont, onFontFamilySelect } = props;
  const [fontLoaded, setFontLoaded] = useState(false);

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

  const handleFontFamilySelect = (font: Font) => {
    onFontFamilySelect(font);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={true}
          className="w-[200px] justify-between text-sm"
        >
          {selectedFont?.family}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Select font</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fonts.map((font) => (
          <DropdownMenuItem
            key={font.family}
            onSelect={() => handleFontFamilySelect(font)}
            className="flex items-center space-x-2 justify-start"
          >
            <Button
              onClick={() => handleFontFamilySelect(font)}
              variant={selectedFont?.family === font.family ? "default" : "outline"}
              className="flex items-center space-x-2 justify-start"
            >
              {selectedFont?.family === font.family && (
                <Check className="h-4 w-4" />
              )}
              <span style={{ fontFamily: font.family }} className="text-sm">
                {font.family}
              </span>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Text;
export { Text as TextControls };
