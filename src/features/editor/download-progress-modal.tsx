
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDownloadState } from "./store/use-download-state";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { download } from "@/utils/download";

const DownloadProgressModal = () => {
  const { progress, displayProgressModal, output, actions, exportType } =
    useDownloadState();
  const isCompleted = progress === 100;

  const handleDownload = async () => {
    if (output?.url) {
      // Use a more descriptive filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `exported-video-${timestamp}`;
      
      await download(output.url, filename, output.type);
      console.log("Download started for:", filename);
    }
  };

  const handleClose = () => {
    actions.setDisplayProgressModal(false);
    // Reset progress when closing
    if (isCompleted) {
      actions.setProgress(0);
      actions.setState({ output: undefined });
    }
  };

  return (
    <Dialog
      open={displayProgressModal}
      onOpenChange={handleClose}
    >
      <DialogContent className="flex h-[627px] flex-col gap-0 bg-background p-0 sm:max-w-[844px]">
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />
        <XIcon
          onClick={handleClose}
          className="absolute right-4 top-5 h-5 w-5 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
        />
        <div className="flex h-16 items-center border-b px-4 font-medium">
          {exportType === "json" ? "Export JSON" : "Export Video"}
        </div>
        {isCompleted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 space-y-4">
            <div className="flex flex-col items-center space-y-1 text-center">
              <div className="font-semibold">
                <CircleCheckIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="font-bold">Export Complete!</div>
              <div className="text-muted-foreground">
                {exportType === "json" 
                  ? "You can download the project JSON file to your device."
                  : "You can download the video to your device."
                }
              </div>
            </div>
            <Button onClick={handleDownload}>Download</Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-5xl font-semibold">
              {Math.floor(progress)}%
            </div>
            <div className="font-bold">
              {exportType === "json" ? "Preparing JSON..." : "Exporting Video..."}
            </div>
            <div className="text-center text-zinc-500">
              <div>
                {exportType === "json" 
                  ? "Preparing your project data for download."
                  : "Rendering your video. This may take a few moments."
                }
              </div>
              <div>Please wait while we process your {exportType === "json" ? "project" : "video"}.</div>
            </div>
            <Button 
              variant={"outline"}
              onClick={() => {
                actions.setExporting(false);
                actions.setDisplayProgressModal(false);
                actions.setProgress(0);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadProgressModal;
