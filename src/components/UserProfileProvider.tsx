import React, { createContext, useContext, ReactNode } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/services/api';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  remainingCredits: number;
  usagePercentage: number;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const userProfileData = useUserProfile();

  return (
    <UserProfileContext.Provider value={userProfileData}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
}; 