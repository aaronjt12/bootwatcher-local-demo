import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  // Set the returnTo URL based on the environment
  const returnToUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://www.bootwatcher.com' // Production: Redirect to bootwatcher.com
      : 'http://localhost:5173'; // Development: Redirect to localhost

  return {
    login: loginWithRedirect,
    logout: () => logout({ returnTo: returnToUrl }),
    user,
    isAuthenticated,
    isLoading,
  };
};