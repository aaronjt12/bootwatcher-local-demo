import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://www.bootwatcher.com/callback'
      : 'http://localhost:5173/callback';

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || '/map');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export { AuthProvider };