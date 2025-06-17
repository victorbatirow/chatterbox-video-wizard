import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ensureUserExists } from '@/services/api';

export const useUserSetup = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [isUserSetup, setIsUserSetup] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const setupUser = async () => {
      if (!isAuthenticated || !user || isUserSetup || isSettingUp) return;

      // Check if we already created this user
      const userKey = `pamba_user_${user.sub}`;
      const wasCreated = sessionStorage.getItem(userKey);
      
      if (wasCreated) {
        setIsUserSetup(true);
        return;
      }

      setIsSettingUp(true);
      try {
        const token = await getAccessTokenSilently();
        await ensureUserExists(token, user);
        
        // Mark user as created for this session
        sessionStorage.setItem(userKey, 'true');
        setIsUserSetup(true);
      } catch (error) {
        console.warn('User setup failed:', error);
        // Still mark as setup to avoid infinite retries
        setIsUserSetup(true);
      } finally {
        setIsSettingUp(false);
      }
    };

    setupUser();
  }, [isAuthenticated, user, getAccessTokenSilently, isUserSetup, isSettingUp]);

  return { isUserSetup, isSettingUp };
};