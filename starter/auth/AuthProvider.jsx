import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const domain = 'dev-qtw3oq5f0dyu07fo.us.auth0.com';
  const clientId = '1007091338240-k8p1eetqf0r79v82b2fb436susakbt0s.apps.googleusercontent.com';

  // Validate environment variables
  if (!domain || !clientId) {
    throw new Error(
      'Auth0 configuration is missing. Please set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID in your environment variables.'
    );
  }

  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://www.bootwatcher.com/map'
      : 'http://localhost:5173/callback';

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