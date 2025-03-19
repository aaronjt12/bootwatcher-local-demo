import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Add this
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { AuthProvider, useAuth } from "../auth";
import ParkingLots from "./components/ParkingLots";
import NoLocationFound from "./components/NoLocationFound";

const App = () => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);
  const { login, logout, user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Got user location:", { latitude, longitude });
          setUserLocation({ lat: latitude, lng: longitude });
          setIsGeoLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setIsGeoLoading(false);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
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
            <p>Welcome, {user.name}!</p>
            <button onClick={logout}>Log Out</button>
          </>
        ) : (
          <button onClick={login}>Log In</button>
        )}
      </div>

      <APIProvider
  apiKey={import.meta.env.VITE_MAPS_API_KEY}
  onLoad={() => console.log("Maps API has loaded.")} // Remove 'libraries' prop
>
  {userLocation ? (
    <div className="map-container" style={{ height: '500px', width: '100%' }}>
      <Map
        defaultZoom={13}
        defaultCenter={userLocation}
        onCameraChanged={(ev) => {
          console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom);
        }}
        mapId="da37f3254c6a6d1c"
      >
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

const RootApp = () => (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

export default RootApp;

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Element with id 'app' not found in the DOM");
}
const root = createRoot(appElement);
root.render(<RootApp />);