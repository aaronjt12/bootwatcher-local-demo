import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  return {
    login: loginWithRedirect,
    logout: () => logout({ returnTo: window.location.origin }),
    user,
    isAuthenticated,
    isLoading,
  };
};