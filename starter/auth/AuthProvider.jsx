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

  // Validate environment variables
  if (!domain || !clientId) {
    throw new Error(
      'Auth0 configuration is missing. Please set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID in your environment variables.'
    );
  }

  // Log the values for debugging
  console.log('Auth0 Domain:', domain);
  console.log('Client ID:', clientId);
  console.log('Redirect URI:', redirectUri);
  console.log('Environment:', process.env.NODE_ENV);

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/map');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export { AuthProvider };