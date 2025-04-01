import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Hardcode the Auth0 domain and client ID
  const domain = 'dev-qtw3oq5f0dyu07fo.us.auth0.com'; // Replace with your Auth0 domain
  const clientId = 'rGFdjU4P5ptlPpd799QKbRfggmYH1oHk'; // Replace with your Auth0 Client ID

  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://www.bootwatcher.com/map'
      : 'http://localhost:5173/callback';

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