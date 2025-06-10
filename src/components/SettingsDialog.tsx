
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { X, Settings, User } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const location = useLocation();
  const isInProject = location.pathname === '/chat';
  const [defaultTab, setDefaultTab] = useState(isInProject ? "project" : "workspace");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 z-[10000] bg-black/80" />
      <DialogContent className="fixed left-[50%] top-[50%] z-[10000] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-0 shadow-lg duration-300 md:max-w-[1200px] flex h-[90dvh] max-h-[640px] w-[95dvw] flex-1 flex-col items-start">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-7 w-7 hover:bg-transparent hover:opacity-75"
        >
          <X className="h-4 w-4" />
        </Button>

        <Tabs
          defaultValue={defaultTab}
          orientation="vertical"
          className="mt-0 flex w-full flex-1 flex-col items-start overflow-hidden md:flex-row"
        >
          <TabsList className="mt-[22px] h-full w-full flex-col gap-0.5 overflow-y-auto px-4 py-6 md:mt-0 md:w-[240px] md:flex-nowrap md:border-r hidden md:flex bg-transparent">
            {isInProject && (
              <>
                <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0">
                  Project
                </div>
                <TabsTrigger
                  value="project"
                  className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted md:w-auto"
                >
                  <Settings className="h-4 w-4" />
                  <p>Project Settings</p>
                </TabsTrigger>
              </>
            )}

            <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0">
              Workspace
            </div>
            <TabsTrigger
              value="workspace"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted md:w-auto -ml-0.5"
            >
              <Avatar className="h-5 w-5 rounded-[6px]">
                <AvatarFallback className="bg-purple-600 text-white font-medium text-xs rounded-[6px]">
                  V
                </AvatarFallback>
              </Avatar>
              <p className="-ml-0.5">victor's Pamba</p>
            </TabsTrigger>

            <TabsTrigger
              value="people"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted md:w-auto"
            >
              <User className="h-4 w-4" />
              <p>People</p>
            </TabsTrigger>

            <TabsTrigger
              value="billing"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted md:w-auto"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 -960 960 960" 
                className="h-4 w-4" 
                fill="currentColor"
              >
                <path d="M880-740v520q0 24.75-17.62 42.37Q844.75-160 820-160H140q-24.75 0-42.37-17.63Q80-195.25 80-220v-520q0-24.75 17.63-42.38Q115.25-800 140-800h680q24.75 0 42.38 17.62Q880-764.75 880-740M140-740v120h680v-120zm0 180v340h680v-340z"/>
              </svg>
              <p>Plans & Billing</p>
            </TabsTrigger>

            <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0">
              Account
            </div>
            <TabsTrigger
              value="account"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted md:w-auto"
            >
              <User className="h-4 w-4" />
              <p>victor batirow</p>
            </TabsTrigger>
          </TabsList>

          <div className="relative h-full w-full flex-1 flex">
            {isInProject && (
              <TabsContent
                value="project"
                className="flex max-h-full w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-20 md:px-10 md:pt-6 m-0"
              >
                <div className="hidden w-full flex-col gap-2 border-b pb-3 md:flex">
                  <h4 className="text-lg font-medium">Project Settings</h4>
                  <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>Manage your project details, visibility, and preferences.</span>
                  </p>
                </div>

                <div className="flex w-full flex-col gap-6">
                  <div className="grid grid-cols-2 gap-5">
                    <p className="col-span-full font-medium">Overview</p>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">Project name</p>
                      <p className="text-muted-foreground">pamba-video-wizard</p>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">Owner</p>
                      <a className="break-words text-sm text-muted-foreground underline" target="_blank" href="/@user">
                        @user
                      </a>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">Created at</p>
                      <p className="text-muted-foreground">2025-06-10 12:00:00</p>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">Messages count</p>
                      <p className="text-muted-foreground">15</p>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">AI Edits count</p>
                      <p className="text-muted-foreground">12</p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-border h-[1px] w-full" />

                  <div className="relative gap-4 pb-4 border-b md:grid md:grid-cols-2 flex justify-between">
                    <div className="flex-col gap-1 md:flex">
                      <p className="flex flex-wrap items-center gap-x-1.5 text-base font-medium">
                        Private Project
                        <span className="inline-flex items-center rounded-sm px-2 py-px text-xs font-medium bg-purple-600 text-white">
                          pro
                        </span>
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Keep your project hidden and prevent others from remixing it.
                      </div>
                    </div>
                    <div className="flex items-center md:justify-end">
                      <Button variant="outline" className="w-[180px] justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Workspace</span>
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 -960 960 960" 
                          className="h-4 w-4 opacity-50" 
                          fill="currentColor"
                        >
                          <path d="M480-356q-6 0-11-2t-10-7L261-563q-9-9-9-21t9-21 21-9 21 9l188 188 188-188q9-9 21-9t21 9 9 21-9 21L501-365q-5 5-10 7t-11 2"/>
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <div className="relative gap-4 pb-4 border-b md:grid md:grid-cols-2 flex justify-between">
                    <div className="flex-col gap-1 md:flex">
                      <p className="flex flex-wrap items-center gap-x-1.5 text-base font-medium">
                        Hide "Pamba" Badge
                        <span className="inline-flex items-center rounded-sm px-2 py-px text-xs font-medium bg-purple-600 text-white">
                          pro
                        </span>
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Remove the "Edit with Pamba" badge from your published work.
                      </div>
                    </div>
                    <div className="flex items-center md:justify-end">
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="relative gap-4 pb-4 border-b md:grid md:grid-cols-2 flex justify-between">
                    <div className="flex-col gap-1 md:flex">
                      <p className="flex flex-wrap items-center gap-x-1.5 text-base font-medium">
                        Rename Project
                      </p>
                      <div className="text-sm text-muted-foreground">Update your project's title.</div>
                    </div>
                    <div className="flex items-center md:justify-end">
                      <Button size="sm">Rename project</Button>
                    </div>
                  </div>

                  <div className="relative gap-4 pb-4 md:grid md:grid-cols-2 flex justify-between">
                    <div className="flex-col gap-1 md:flex">
                      <p className="flex flex-wrap items-center gap-x-1.5 text-base font-medium">
                        Delete Project
                      </p>
                      <div className="text-sm text-muted-foreground">Delete this project.</div>
                    </div>
                    <div className="flex items-center md:justify-end">
                      <Button variant="destructive" size="sm">
                        Delete this project
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent
              value="workspace"
              className="flex max-h-full w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-20 md:px-10 md:pt-6 m-0"
            >
              <div className="hidden w-full flex-col gap-2 border-b pb-3 md:flex">
                <h4 className="text-lg font-medium">Workspace Settings</h4>
                <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>Manage your workspace preferences and settings.</span>
                </p>
              </div>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Workspace settings coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent
              value="people"
              className="flex max-h-full w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-20 md:px-10 md:pt-6 m-0"
            >
              <div className="hidden w-full flex-col gap-2 border-b pb-3 md:flex">
                <h4 className="text-lg font-medium">People</h4>
                <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>Manage team members and collaborators.</span>
                </p>
              </div>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">People management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent
              value="billing"
              className="flex max-h-full w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-20 md:px-10 md:pt-6 m-0"
            >
              <div className="hidden w-full flex-col gap-2 border-b pb-3 md:flex">
                <h4 className="text-lg font-medium">Plans & Billing</h4>
                <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>Manage your subscription and billing information.</span>
                </p>
              </div>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Billing settings coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent
              value="account"
              className="flex max-h-full w-full flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-20 md:px-10 md:pt-6 m-0"
            >
              <div className="hidden w-full flex-col gap-2 border-b pb-3 md:flex">
                <h4 className="text-lg font-medium">Account Settings</h4>
                <p className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>Manage your personal account information.</span>
                </p>
              </div>
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Account settings coming soon...</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
