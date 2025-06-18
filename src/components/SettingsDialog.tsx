import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
import { useUserProfile } from "@/hooks/useUserProfile";
import { loadStripe } from '@stripe/stripe-js';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  disableOpenCloseUrlManagement?: boolean;
}

function formatNumber(number: number): string {
  const formatWithPrecision = (value: number, divisor: number): string => {
    const result = value / divisor;
    return result % 1 === 0 ? result.toFixed(0) : result.toFixed(1);
  };
  
  if (number >= 1e12) {
    return `${formatWithPrecision(number, 1e12)}T`; // Format for trillions
  } else if (number >= 1e9) {
    return `${formatWithPrecision(number, 1e9)}B`; // Format for billions
  } else if (number >= 1e6) {
    return `${formatWithPrecision(number, 1e6)}M`; // Format for millions
  } else if (number >= 1e3) {
    return `${formatWithPrecision(number, 1e3)}K`; // Format for thousands
  } else {
    return `${number}`; // Format for less than 1000
  }
}

function formatUnixTimestamp(timestamp: number): string {
  if (timestamp === 0) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString();
}

const SettingsDialog = ({ isOpen, onClose, disableOpenCloseUrlManagement = false }: SettingsDialogProps) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const [selectedHobbyValue, setSelectedHobbyValue] = useState('1600,price_1RahQ4CmyYc460qRPIcmisOI,Hobby 1')
  const [selectedProValue, setSelectedProValue] = useState('10500,price_1RahY6CmyYc460qRoWUq57Ur,Pro 1')
  const [stripeCPURL, setStripeCPURL] = useState('https://billing.stripe.com/p/login/test_14A6oG5aJ4LDaWLdKX18c00')
  const isInProject = location.pathname.startsWith('/chat');
  
  const { userProfile, loading: profileLoading, usagePercentage, remainingCredits } = useUserProfile();
  
  // Get settings type and tab from URL params
  const settingsParam = searchParams.get('settings');
  const isSettingsOpen = settingsParam !== null;
  
  const createCheckoutSession = async (price_id:string) => {
  const token = await getAccessTokenSilently();
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/billing/create-stripe-checkout-session`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' },
    body: JSON.stringify({"price_id":price_id})
  });

  
  const { session_id } = await response.json();
  console.log(session_id)
  console.log(import.meta.env)
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  stripe?.redirectToCheckout({ sessionId: session_id });
};

useEffect(() => {
    const fetchStripeURL = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/billing/create-customer-portal-session`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (data.portal_url) {
          setStripeCPURL(data.portal_url);
        }
      } catch (error) {
        console.error('Failed to fetch customer portal URL:', error);
      }
    };

    fetchStripeURL();
  }, []);

  // Determine default tab based on context and URL
  const getDefaultTab = () => {
    // If open/close URL management is disabled, still read URL for initial tab but use context defaults as fallback
    if (disableOpenCloseUrlManagement) {
      if (settingsParam === 'project' && isInProject) return 'project';
      if (settingsParam === 'workspace') return 'workspace';
      if (settingsParam === 'people') return 'people';
      if (settingsParam === 'billing') return 'billing';
      if (settingsParam === 'account') return 'account';
      return isInProject ? 'project' : 'workspace';
    }
    
    if (settingsParam === 'project' && isInProject) return 'project';
    if (settingsParam === 'workspace') return 'workspace';
    if (settingsParam === 'people') return 'people';
    if (settingsParam === 'billing') return 'billing';
    if (settingsParam === 'account') return 'account';
    
    // Fallback to context-based default
    return isInProject ? 'project' : 'workspace';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update the active tab when the dialog opens and open/close URL management is disabled
  useEffect(() => {
    if (disableOpenCloseUrlManagement && isOpen) {
      const defaultTab = isInProject ? 'project' : 'workspace';
      // If we have a settings parameter in URL, use it, otherwise use default
      const urlTab = settingsParam || defaultTab;
      setActiveTab(urlTab);
    }
  }, [disableOpenCloseUrlManagement, isOpen, isInProject, settingsParam]);

  // Update URL when settings are opened/closed (only if open/close URL management is enabled)
  useEffect(() => {
    if (disableOpenCloseUrlManagement) return;
    
    if (isOpen && !isSettingsOpen) {
      // Open settings - add appropriate settings param
      const newParams = new URLSearchParams(searchParams);
      const defaultSetting = isInProject ? 'project' : 'workspace';
      newParams.set('settings', defaultSetting);
      setSearchParams(newParams);
      setActiveTab(defaultSetting);
    } else if (!isOpen && isSettingsOpen) {
      // Close settings - remove settings param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('settings');
      setSearchParams(newParams);
    }
  }, [isOpen, isSettingsOpen, isInProject, searchParams, setSearchParams, disableOpenCloseUrlManagement]);

  // Update URL when tab changes (always enabled - this should work in both modes)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('settings', value);
    setSearchParams(newParams);
  };

  // Handle dialog close
  const handleClose = () => {
    if (!disableOpenCloseUrlManagement) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('settings');
      setSearchParams(newParams);
    }
    onClose();
  };

  // Sync with URL changes (only if open/close URL management is enabled)
  useEffect(() => {
    if (disableOpenCloseUrlManagement) return;
    
    if (settingsParam && settingsParam !== activeTab) {
      setActiveTab(settingsParam);
    }
  }, [settingsParam, activeTab, disableOpenCloseUrlManagement]);

  const handleHobbySelectChange = (value) => {
    setSelectedHobbyValue(value);
  }
  const handleProSelectChange = (value) => {
    setSelectedProValue(value);
  }

  // Plan comparison helper functions
  const getUserCurrentPlan = () => {
    if (!userProfile || userProfile.subscription_status !== 'active') {
      return null;
    }
    return `${userProfile.monthly_credits},${userProfile.stripe_price_id},${userProfile.subscribed_product_name}`;
  };

  const getButtonText = (selectedValue: string, planType: 'hobby' | 'pro') => {
    const userCurrentPlan = getUserCurrentPlan();
    const isActive = userProfile?.subscription_status === 'active';
    
    // Free plan users
    if (!isActive) {
      return "Upgrade";
    }
    
    // Paid plan users
    if (userCurrentPlan === selectedValue) {
      return "Current Plan";
    }
    
    const selectedCredits = parseInt(selectedValue.split(',')[0]);
    const userCredits = userProfile?.monthly_credits || 0;
    
    return selectedCredits > userCredits ? "Upgrade" : "Downgrade";
  };

  const isButtonDisabled = (selectedValue: string) => {
    const userCurrentPlan = getUserCurrentPlan();
    const isActive = userProfile?.subscription_status === 'active';
    
    return isActive && userCurrentPlan === selectedValue;
  };

  const handlePlanChange = (selectedValue: string) => {
    const userCurrentPlan = getUserCurrentPlan();
    const isActive = userProfile?.subscription_status === 'active';
    
    // If not active or upgrading, use checkout session
    if (!isActive) {
      createCheckoutSession(selectedValue.split(",")[1]);
      return;
    }
    
    // If current plan, do nothing
    if (userCurrentPlan === selectedValue) {
      return;
    }
    
    const selectedCredits = parseInt(selectedValue.split(',')[0]);
    const userCredits = userProfile?.monthly_credits || 0;
    
    // If upgrading, use checkout session
    if (selectedCredits > userCredits) {
      createCheckoutSession(selectedValue.split(",")[1]);
    } else {
      // If downgrading, redirect to customer portal
      window.open(stripeCPURL, '_self');
    }
  };

  // Helper functions for display
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.name || user?.email || 'User';
  };

  const getWorkspaceName = () => {
    const displayName = getUserDisplayName();
    // return `${displayName}'s Pamba`;
    return `My Pamba`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed left-[50%] top-[50%] z-[10001] max-w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-xl border bg-background p-0 shadow-lg duration-300 md:max-w-[1200px] flex h-[90dvh] max-h-[640px] w-[95dvw] flex-1 overflow-hidden [&>div:first-child]:bg-black/5">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Manage your project and account settings</DialogDescription>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
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
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <p className="-ml-0.5">{getWorkspaceName()}</p>
            </TabsTrigger>

            {/* <TabsTrigger
              value="people"
              className="flex min-h-8 w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-start text-sm data-[state=active]:bg-muted hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <p>People</p>
            </TabsTrigger> */}

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
              <p>{getUserDisplayName()}</p>
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
                <div className="flex-1 p-6 space-y-6">
                  <div className="space-y-4">
                    <h5 className="font-medium">Workspace Overview</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Workspace Name</p>
                        <p className="text-sm text-muted-foreground">{getWorkspaceName()}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Owner Email</p>
                        <p className="text-sm text-muted-foreground">
                          {profileLoading ? 'Loading...' : (userProfile?.email || user?.email || 'Unknown')}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subscription Status</p>
                        <p className="text-sm text-muted-foreground">
                          {profileLoading ? 'Loading...' : (userProfile?.subscription_status || 'inactive')}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {profileLoading ? 'Loading...' : (userProfile?.subscribed_product_name || 'No Subscription')}
                        </p>
                      </div>
                    </div>
                  </div>
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
                      Choose plans for just starting out, or expanding your video generation.
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
                      <span className="text-sm text-muted-foreground">
                        {profileLoading ? 'Loading...' : `${userProfile?.used_credits || 0}/${userProfile?.monthly_credits || 0}`}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profileLoading ? (
                        'Loading subscription information...'
                      ) : userProfile?.subscription_status === 'active' ? (
                        <>
                          You're currently subscribed to plan: <strong>{userProfile.subscribed_product_name}</strong>.{' '}
                          <button onClick={() => window.open(stripeCPURL, '_self')} 
                          className="underline">Manage your payment preferences</button>, or change your plan below. 
                          {userProfile.current_period_end > 0 && (
                            <> Your monthly credits will renew on {formatUnixTimestamp(userProfile.current_period_end)}.</>
                          )}
                        </>
                      ) : (
                        'You don\'t have an active subscription. Choose a plan below to get started.'
                      )}
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

                      {/* Only show button for free users or when loading */}
                      {(profileLoading || userProfile?.subscription_status !== 'active') && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled={true}
                        >
                          {profileLoading ? 'Loading...' : 'Current Plan'}
                        </Button>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Get started with:</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Pamba access</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="border rounded-lg p-6 space-y-4 relative">
             
                      
                      <div>
                        <h3 className="text-lg font-semibold">Hobby</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">${formatNumber(parseInt(selectedHobbyValue.split(",")[0])/100)}</span>
                          <span className="text-muted-foreground"> /month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Start creating videos</p>
                      </div>
                      
                      <Select defaultValue={selectedHobbyValue} onValueChange={handleHobbySelectChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="1600,price_1RahQ4CmyYc460qRPIcmisOI,Hobby 1">1.6K credits / month</SelectItem>
                          <SelectItem value="3200,price_1RahSNCmyYc460qRr1Wcoy2O,Hobby 3">3.2K credits / month</SelectItem>
                          <SelectItem value="5000,price_1RahVqCmyYc460qRamtXAUvF,Hobby 5">5K credits / month</SelectItem>
                          <SelectItem value="6000,price_1RahW5CmyYc460qRn46VLJPH,Hobby 6">6K credits / month</SelectItem>
                          <SelectItem value="7000,price_1RahWVCmyYc460qRSMDK3PL6,Hobby 7">7K credits / month</SelectItem>
                          <SelectItem value="8000,price_1RahWwCmyYc460qRY8i5N0hY,Hobby 8">8K credits / month</SelectItem>
                          <SelectItem value="9000,price_1RahXOCmyYc460qRjaqJUOW0,Hobby 9">9K credits / month</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        className="w-full z-0" 
                        disabled={isButtonDisabled(selectedHobbyValue)}
                        onClick={() => handlePlanChange(selectedHobbyValue)}
                      >
                        {profileLoading ? 'Loading...' : getButtonText(selectedHobbyValue, 'hobby')}
                      </Button>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Everything in Free, plus:</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{formatNumber(parseInt(selectedHobbyValue.split(",")[0]))} credits / month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Private projects</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>No watermark</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Commercial use</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Teams Plan */}
                    <div className="border rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Pro</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">${formatNumber(parseInt(selectedProValue.split(",")[0])/105)}</span>
                          <span className="text-muted-foreground"> /month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">For expanded production and bonus credits</p>
                      </div>

                      <Select defaultValue={selectedProValue} onValueChange={handleProSelectChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent  className="z-50">
                          <SelectItem value="10500,price_1RahY6CmyYc460qRoWUq57Ur,Pro 1">{formatNumber(10500)} credits / month</SelectItem>
                          <SelectItem value="21000,price_1RahiWCmyYc460qR1qQXvhDm,Pro 2">{formatNumber(21000)} credits / month</SelectItem>
                          <SelectItem value="31500,price_1RahirCmyYc460qRwKzYr9WV,Pro 3">{formatNumber(31500)} credits / month</SelectItem>
                          <SelectItem value="42000,price_1RahjBCmyYc460qR8X5jKSIJ,Pro 4">{formatNumber(42000)} credits / month</SelectItem>
                          <SelectItem value="52500,price_1RahjbCmyYc460qRA0lD8pjg,Pro 5">{formatNumber(52500)} credits / month</SelectItem>
                          <SelectItem value="78750,price_1RahlsCmyYc460qR3V0yQMki,Pro 7.5">{formatNumber(78750)} credits / month</SelectItem>
                          <SelectItem value="105000,price_1RahmFCmyYc460qRKlDoix1A,Pro 10">{formatNumber(105000)} credits / month</SelectItem>
                          <SelectItem value="157500,price_1RahnYCmyYc460qR8R5Ctaes,Pro 15">{formatNumber(157500)} credits / month</SelectItem>
                          <SelectItem value="210000,price_1RahnwCmyYc460qRwT8zVkCD,Pro 20">{formatNumber(210000)} credits / month</SelectItem>
                          <SelectItem value="262500,price_1RahoNCmyYc460qRkowz5alE,Pro 25">{formatNumber(262500)} credits / month</SelectItem>
                          <SelectItem value="315000,price_1RahoxCmyYc460qR6uZlTIOi,Pro 30">{formatNumber(315000)} credits / month</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 z-10"
                        disabled={isButtonDisabled(selectedProValue)}
                        onClick={() => handlePlanChange(selectedProValue)}
                      >
                        {profileLoading ? 'Loading...' : getButtonText(selectedProValue, 'pro')}
                      </Button>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Everything in Hobby, plus:</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{formatNumber(parseInt(selectedProValue.split(",")[0]))} credits / month</span>
                          </div>
                           <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Including 5% ({formatNumber(parseInt(selectedProValue.split(",")[0])/1.05*0.05)}) bonus credits / month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Priority in generation queue</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Priority support</span>
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
                <div className="flex-1 p-6 space-y-6">
                  <div className="space-y-4">
                    <h5 className="font-medium">Account Information</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Display Name</p>
                        <p className="text-sm text-muted-foreground">{getUserDisplayName()}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">
                          {profileLoading ? 'Loading...' : (userProfile?.email || user?.email || 'Unknown')}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Account Status</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email_verified ? 'Verified' : 'Unverified'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subscription</p>
                        <p className="text-sm text-muted-foreground">
                          {profileLoading ? 'Loading...' : (userProfile?.subscribed_product_name || 'No Subscription')}
                        </p>
                      </div>
                    </div>

                    {userProfile?.subscription_status === 'active' && (
                      <div className="space-y-4 pt-4 border-t">
                        <h6 className="font-medium">Billing Information</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Billing Period</p>
                            <p className="text-sm text-muted-foreground">
                              {formatUnixTimestamp(userProfile.current_period_start)} - {formatUnixTimestamp(userProfile.current_period_end)}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Credits Usage</p>
                            <p className="text-sm text-muted-foreground">
                              {userProfile.used_credits} of {userProfile.monthly_credits} used ({remainingCredits} remaining)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
