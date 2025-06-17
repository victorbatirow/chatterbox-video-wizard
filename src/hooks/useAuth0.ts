import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { ensureUserExists } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const auth0 = useAuth0();
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Ensure user exists in backend when authenticated
  useEffect(() => {
    const createBackendUser = async () => {
      if (auth0.isAuthenticated && auth0.user && !isUserCreated && !isCreatingUser) {
        setIsCreatingUser(true);
        try {
          const token = await auth0.getAccessTokenSilently();
          await ensureUserExists(token, auth0.user);
          setIsUserCreated(true);
        } catch (error) {
          console.error('Error creating backend user:', error);
          toast({
            title: "Setup Error",
            description: "There was an issue setting up your account. Please try refreshing the page.",
            variant: "destructive",
          });
        } finally {
          setIsCreatingUser(false);
        }
      }
    };

    createBackendUser();
  }, [auth0.isAuthenticated, auth0.user, isUserCreated, isCreatingUser, auth0.getAccessTokenSilently]);

  return {
    ...auth0,
    isUserCreated,
    isCreatingUser,
  };
};