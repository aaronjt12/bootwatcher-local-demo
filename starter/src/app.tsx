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

// Simple function to get API key directly from environment variables
const getMapsApiKey = (): string => {
  return import.meta.env.VITE_MAPS_API_KEY;
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
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
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
       onCameraChanged={(ev: { detail?: MapCameraChangedEvent }) => {
         const cameraEvent = ev.detail ?? {
           center: { lat: 0, lng: 0 },
           zoom: 13,
           bounds: null,
         };
     
         console.log("Camera changed:", cameraEvent.center, "Zoom:", cameraEvent.zoom);
       }}
       mapId="da37f3254c6a6d1c"
     >
     
          <AdvancedMarker position={userLocation}>
            <img
              src={"/images/pin_8668861.png"}
              width={34}
              height={34}
              title="Current Location"
            />
          </AdvancedMarker>
          {/* load marking lots */}
          <ParkingLots userLocation={userLocation} />

          {/* <PoiMarkers pois={locations} /> */}
        </Map>
      ) : (
        <NoLocationFound />
      )}
    </APIProvider>
  );
};

export default App;

const appElement = document.getElementById("app");
if (appElement) {
  const root = createRoot(appElement);
  root.render(<App />);
} else {
  console.error("Error: Could not find the 'app' element in the DOM.");
}
