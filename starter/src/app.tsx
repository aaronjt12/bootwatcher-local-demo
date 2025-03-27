import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withAuthenticationRequired, Auth0Provider } from "@auth0/auth0-react";
import { useAuth } from "../auth/index";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import ParkingLots from "./components/ParkingLots";
import NoLocationFound from "./components/NoLocationFound";

// Auth0 Configuration
const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const redirectUri = window.location.origin + "/map";

// Login Page Component
const LoginPage = () => {
  const { loginWithRedirect } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Login</h2>
      <button onClick={() => loginWithRedirect()}>Log In</button>
    </div>
  );
};

// Map Page Component (Protected)
const MapPage = () => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);
  const { logout, user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsGeoLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setIsGeoLoading(false);
        }
      );
    } else {
      setIsGeoLoading(false);
    }
  }, []);

  if (authLoading || isGeoLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="auth-section">
        {isAuthenticated ? (
          <>
            <p>Welcome, {user?.name}!</p>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Log Out</button>
          </>
        ) : (
          <button onClick={() => loginWithRedirect()}>Log In</button>
        )}
      </div>

      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
        {userLocation ? (
          <div className="map-container" style={{ height: "500px", width: "100%" }}>
            <Map defaultZoom={13} defaultCenter={userLocation} mapId="da37f3254c6a6d1c">
              <AdvancedMarker position={userLocation}>
                <img
                  src="/images/pin_8668861.png"
                  width={34}
                  height={34}
                  title="Current Location"
                  alt="Current Location"
                />
              </AdvancedMarker>
              <ParkingLots userLocation={userLocation} />
            </Map>
          </div>
        ) : (
          <NoLocationFound />
        )}
      </APIProvider>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ element }) => {
  const Component = withAuthenticationRequired(() => element, {
    onRedirecting: () => <div>Loading...</div>,
  });
  return <Component />;
};

// Main App Component with Routing
export const App = () => {
  return (
    <Routes>
      {/* Redirect '/' to '/login' */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/map" element={<ProtectedRoute element={<MapPage />} />} />
    </Routes>
  );
};

// Root Component with Auth0 Provider
const RootApp = () => (
  <Auth0Provider domain={domain} clientId={clientId} authorizationParams={{ redirect_uri: redirectUri }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Auth0Provider>
);

// Render the App
const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Element with id 'app' not found in the DOM");
}
const root = createRoot(appElement);
root.render(<RootApp />);


