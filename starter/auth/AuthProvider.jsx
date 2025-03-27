import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { App } from '../src/app';

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  // Set the redirectUri based on the environment
  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://bootwatcher.com/callback' // Use a dedicated callback route in production
      : 'http://localhost:5173/callback'; // Use localhost for development

  const onRedirectCallback = (appState) => {
    // Navigate to /map after the callback is processed
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

const Root = () => (
  <BrowserRouter>
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  </BrowserRouter>
);

const root = createRoot(document.getElementById('root'));
root.render(<Root />);