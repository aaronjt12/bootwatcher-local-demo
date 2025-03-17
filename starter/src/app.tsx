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

import ParkingLots from "./components/ParkingLots";
import NoLocationFound from "./components/NoLocationFound";

interface Location {
  lat: number;
  lng: number;
}

// Log environment variables for debugging
console.log('Maps API Key:', import.meta.env.VITE_MAPS_API_KEY);

const App = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Default to a location if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Default to a location if geolocation is not supported
      setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco
    }
  }, []);

  const handleCameraChange = (ev: { detail: MapCameraChangedEvent }) => {
    console.log(
      "camera changed:",
      ev.detail.center,
      "zoom:",
      ev.detail.zoom
    );
  };

  // Use a default API key if the environment variable is not set
  const mapsApiKey = import.meta.env.VITE_MAPS_API_KEY || "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO";

  return (
    <APIProvider
      apiKey={mapsApiKey}
      library={["places"]}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      {userLocation ? (
        <Map
          defaultZoom={13}
          defaultCenter={userLocation}
          onCameraChanged={handleCameraChange}
          mapId="da37f3254c6a6d1c"
        >
          <AdvancedMarker position={userLocation}>
            <img
              src="/images/pin_8668861.png"
              width={34}
              height={34}
              title="Current Location"
            />
          </AdvancedMarker>
          <ParkingLots userLocation={userLocation} />
        </Map>
      ) : (
        <NoLocationFound />
      )}
    </APIProvider>
  );
};

export default App;

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}