import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom'; // For redirecting after login

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    // Redirect to the original URL (or home) after login
    navigate(appState?.returnTo || '/');
  };

  return (
    <Auth0Provider
      domain={process.env.VITE_AUTH0_DOMAIN || "dev-qtw3oq5f0dyu07fo.us.auth0.com"}
      clientId={process.env.VITE_AUTH0_CLIENT_ID || "rGFdjU4P5ptlPpd799QKbRfggmYH1oHk"}
      redirectUri={window.location.origin}
      useRefreshTokens // Optional: Enable refresh tokens for SPA
    cacheLocation="localstorage" // Optional: Store tokens in localStorage
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;