import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, User, Check, Info } from "lucide-react";

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
      <DialogContent className="fixed left-[50%] top-[50%] z-[10001] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-xl border bg-background p-0 shadow-lg duration-300 md:max-w-[1200px] flex h-[90dvh] max-h-[640px] w-[95dvw] flex-1 overflow-hidden [&>div:first-child]:bg-black/10">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Manage your project and account settings</DialogDescription>

        <Tabs
          defaultValue={defaultTab}
          orientation="vertical"
          className="flex w-full h-full"
        >
          <TabsList className="h-full w-[240px] flex-col gap-0.5 overflow-y-auto px-4 py-6 border-r bg-transparent justify-start items-start flex-shrink-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
            }}
          >
            {isInProject && (
              <>
                <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0 w-full text-left">
                  Project
                </div>
                <TabsTrigger
                  value="project"
                  className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  <p>Project Settings</p>
                </TabsTrigger>
              </>
            )}

            <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0 w-full text-left">
              Workspace
            </div>
            <TabsTrigger
              value="workspace"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted hover:text-current -ml-0.5"
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
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <p>People</p>
            </TabsTrigger>

            <TabsTrigger
              value="billing"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted"
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

            <div className="mb-1 mt-6 px-3 text-xs font-medium text-muted-foreground first:mt-0 w-full text-left">
              Account
            </div>
            <TabsTrigger
              value="account"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <p>victor batirow</p>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 h-full overflow-hidden">
            {isInProject && (
              <TabsContent
                value="project"
                className="h-full w-full overflow-y-auto p-0 m-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                }}
              >
                <div className="h-full w-full flex flex-col">
                  <div className="border-b p-6">
                    <h4 className="text-lg font-medium">Project Settings</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your project details, visibility, and preferences.
                    </p>
                  </div>

                  <div className="flex-1 p-6 space-y-6">
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
                </div>
              </TabsContent>
            )}

            <TabsContent
              value="workspace"
              className="h-full w-full overflow-y-auto p-0 m-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <div className="h-full w-full flex flex-col">
                <div className="border-b p-6">
                  <h4 className="text-lg font-medium">Workspace Settings</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your workspace preferences and settings.
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Workspace settings coming soon...</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="people"
              className="h-full w-full overflow-y-auto p-0 m-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <div className="h-full w-full flex flex-col">
                <div className="border-b p-6">
                  <h4 className="text-lg font-medium">People</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage team members and collaborators.
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">People management coming soon...</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="billing"
              className="h-full w-full overflow-y-auto p-0 m-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <div className="h-full w-full flex flex-col">
                <div className="border-b p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium">Plans & Billing</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose plans for starting solo, growing your projects, and collaborating with your team.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Docs
                  </Button>
                </div>

                <div className="flex-1 p-6 space-y-8">
                  {/* Credits Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Credits</h5>
                      <span className="text-sm text-muted-foreground">201/400</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50.25%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You're currently subscribed to plan: <strong>Pro 3</strong> charged at $100/mo.{' '}
                      <button className="underline">Manage your payment preferences</button>, or change your plan below. Your monthly credits will renew on June 17 at 15:18.
                    </p>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className="border rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Free</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">$0</span>
                          <span className="text-muted-foreground"> /month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">For getting started</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span>5 daily credits</span>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <Button variant="outline" className="w-full">
                        Downgrade
                      </Button>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Get started with:</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Public projects</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-600 rounded-lg p-6 space-y-4 relative">
                      <div className="absolute -top-2 left-4">
                        <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded">POPULAR</span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Pro</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">$100</span>
                          <span className="text-muted-foreground"> /month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">For more projects and usage</p>
                      </div>

                      <Select defaultValue="400">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 credits / month</SelectItem>
                          <SelectItem value="200">200 credits / month</SelectItem>
                          <SelectItem value="400">400 credits / month</SelectItem>
                          <SelectItem value="800">800 credits / month</SelectItem>
                          <SelectItem value="1200">1200 credits / month</SelectItem>
                          <SelectItem value="2000">2000 credits / month</SelectItem>
                          <SelectItem value="3000">3000 credits / month</SelectItem>
                          <SelectItem value="4000">4000 credits / month</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button className="w-full" disabled>
                        Your current plan
                      </Button>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Everything in Free, plus:</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>400 credits / month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Private projects</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Remove the Lovable badge</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Custom domains</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>3 editors per project</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Teams Plan */}
                    <div className="border rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Teams</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">$240</span>
                          <span className="text-muted-foreground"> /month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">For collaborating with others</p>
                      </div>

                      <Select defaultValue="800">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="800">800 credits / month</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Upgrade
                      </Button>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Everything in Pro, plus:</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Centralised billing</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Centralised access management</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Includes 20 seats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Section */}
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Enterprise</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          For custom needs, dedicated support, SSO, and to opt out of data training.
                        </p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Contact us
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="account"
              className="h-full w-full overflow-y-auto p-0 m-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}
            >
              <div className="h-full w-full flex flex-col">
                <div className="border-b p-6">
                  <h4 className="text-lg font-medium">Account Settings</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your personal account information.
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Account settings coming soon...</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
