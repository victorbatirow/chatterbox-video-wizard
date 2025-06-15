
import { IDesign } from "@designcombo/types";
import { create } from "zustand";

interface Output {
  url: string;
  type: string;
}

interface DownloadState {
  projectId: string;
  exporting: boolean;
  exportType: "json" | "mp4";
  progress: number;
  output?: Output;
  payload?: IDesign;
  displayProgressModal: boolean;
  actions: {
    setProjectId: (projectId: string) => void;
    setExporting: (exporting: boolean) => void;
    setExportType: (exportType: "json" | "mp4") => void;
    setProgress: (progress: number) => void;
    setState: (state: Partial<DownloadState>) => void;
    setOutput: (output: Output) => void;
    startExport: () => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
  };
}

export const useDownloadState = create<DownloadState>((set, get) => ({
  projectId: "",
  exporting: false,
  exportType: "mp4",
  progress: 0,
  displayProgressModal: false,
  actions: {
    setProjectId: (projectId) => set({ projectId }),
    setExporting: (exporting) => set({ exporting }),
    setExportType: (exportType) => set({ exportType }),
    setProgress: (progress) => set({ progress }),
    setState: (state) => set({ ...state }),
    setOutput: (output) => set({ output }),
    setDisplayProgressModal: (displayProgressModal) =>
      set({ displayProgressModal }),
    startExport: async () => {
      try {
        // Set exporting to true at the start
        set({ exporting: true, displayProgressModal: true, progress: 0 });

        const { payload, exportType } = get();

        if (!payload) throw new Error("Payload is not defined");

        if (exportType === "json") {
          // Handle JSON export
          const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(jsonBlob);
          
          set({ 
            progress: 100, 
            exporting: false, 
            output: { url, type: "json" } 
          });
          return;
        }

        // For MP4 export, simulate the export process
        // In a real application, this would be where you'd call your video rendering service
        
        // Simulate progress updates
        const progressSteps = [10, 25, 40, 55, 70, 85, 100];
        let currentStep = 0;

        const updateProgress = () => {
          if (currentStep < progressSteps.length) {
            set({ progress: progressSteps[currentStep] });
            currentStep++;
            
            if (currentStep < progressSteps.length) {
              setTimeout(updateProgress, 500);
            } else {
              // Export completed - for now, we'll use a sample video URL
              // In a real implementation, this would be the rendered video URL
              const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
              
              set({ 
                exporting: false, 
                output: { url: videoUrl, type: "mp4" },
                progress: 100
              });
            }
          }
        };

        updateProgress();

      } catch (error) {
        console.error("Export error:", error);
        set({ exporting: false, progress: 0 });
      }
    },
  },
}));
