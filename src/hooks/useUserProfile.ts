import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserProfile, UserProfile } from '@/services/api';

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  remainingCredits: number;
  usagePercentage: number;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!isAuthenticated || isLoading) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      const profile = await getUserProfile(token);
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchUserProfile();
    }
  }, [isAuthenticated, isLoading]);

  // Calculate derived values
  const remainingCredits = userProfile 
    ? userProfile.monthly_credits - userProfile.used_credits 
    : 0;

  const usagePercentage = userProfile && userProfile.monthly_credits > 0
    ? (userProfile.used_credits / userProfile.monthly_credits) * 100
    : 0;

  return {
    userProfile,
    loading,
    error,
    refetch: fetchUserProfile,
    remainingCredits,
    usagePercentage,
  };
}; 