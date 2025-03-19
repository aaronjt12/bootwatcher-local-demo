/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { AuthProvider, useAuth } from "../auth"; // From starter/auth/
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

  // Show loading state while auth or geolocation is pending
  if (authLoading || isGeoLoading) {
    return <div>Loading...</div>; // Replace with your LoadingScreen component if desired
  }

  return (
    <div className="app-container">
      {/* Basic Auth UI */}
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
        libraries={["places"]} // Fixed typo: "library" -> "libraries"
        onLoad={() => console.log("Maps API has loaded.")}
      >
        {userLocation ? (
          <div className="map-container">
            <Map
              defaultZoom={13}
              defaultCenter={userLocation}
              onCameraChanged={(ev: MapCameraChangedEvent) =>
                console.log(
                  "camera changed:",
                  ev.detail.center,
                  "zoom:",
                  ev.detail.zoom
                )
              }
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

// Wrap App with AuthProvider
const RootApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default RootApp;

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Element with id 'app' not found in the DOM");
}
const root = createRoot(appElement);
root.render(<RootApp />);