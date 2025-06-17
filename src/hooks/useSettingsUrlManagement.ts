import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

export const useSettingsUrlManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check for settings URL parameter on mount and when search params change
  useEffect(() => {
    const settingsParam = searchParams.get('settings');
    if (settingsParam) {
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(false);
    }
  }, [searchParams]);

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    // Remove settings parameter from URL when closing
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('settings');
    // Only update if there are remaining parameters or if we need to clear the query string
    if (newParams.toString()) {
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    } else {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    // Add settings parameter to URL when opening
    const newParams = new URLSearchParams(searchParams);
    // Determine default tab based on location
    const isInProject = location.pathname.startsWith('/chat');
    const defaultTab = isInProject ? 'project' : 'workspace';
    newParams.set('settings', defaultTab);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return {
    isSettingsOpen,
    handleOpenSettings,
    handleCloseSettings,
  };
}; 