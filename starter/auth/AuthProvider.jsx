import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://www.bootwatcher.com/map'
      : 'http://localhost:5173/callback';

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/map');
  };

  return (
    <Auth0Provider
      domain={domain || "your-auth0-domain.auth0.com"}  // Fallback value
      clientId={clientId || "your-client-id"}  // Fallback value
      authorizationParams={{ 
        redirect_uri: redirectUri || window.location.origin + "/map"  // Fallback value
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export { AuthProvider };