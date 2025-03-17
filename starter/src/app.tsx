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

// Add window.env type definition
declare global {
  interface Window {
    env?: {
      VITE_MAPS_API_KEY: string;
      VITE_FIREBASE_API_KEY: string;
      VITE_FIREBASE_AUTH_DOMAIN: string;
      VITE_FIREBASE_DATABASE_URL: string;
      VITE_FIREBASE_PROJECT_ID: string;
      VITE_FIREBASE_STORAGE_BUCKET: string;
      VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      VITE_FIREBASE_APP_ID: string;
    };
  }
}

// Simple function to get API key from environment
const getMapsApiKey = (): string => {
  // First try window.env (for production)
  if (window.env && window.env.VITE_MAPS_API_KEY) {
    return window.env.VITE_MAPS_API_KEY;
  }
  // Then try import.meta.env (for development)
  return import.meta.env.VITE_MAPS_API_KEY || "AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0";
};

const App = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Get the user's current location using geolocation API
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

  return (
    <APIProvider
      apiKey={getMapsApiKey()}
      library={["places"]}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      {userLocation ? (
        <Map
          defaultZoom={13}
          defaultCenter={userLocation}
          onCameraChanged={(ev: { detail: MapCameraChangedEvent }) =>
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