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
  return import.meta.env.VITE_MAPS_API_KEY || "AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0";
};

const App = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Get the user's current location using geolocation API
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Default to a location in case geolocation fails
        setUserLocation({
          lat: 40.7128,
          lng: -74.006,
        });
      }
    );
  }, []);

  // Handle Maps API errors
  useEffect(() => {
    // Add a global error handler for Google Maps API errors
    const handleMapsError = (event: ErrorEvent) => {
      if (event.message.includes("Google Maps JavaScript API error: RefererNotAllowedMapError")) {
        setMapsError("RefererNotAllowedMapError");
      } else if (event.message.includes("Google Maps JavaScript API error: InvalidKeyMapError")) {
        setMapsError("InvalidKeyMapError");
      } else if (event.message.includes("Places API error: ApiNotActivatedMapError")) {
        setMapsError("ApiNotActivatedMapError");
      }
    };

    window.addEventListener('error', handleMapsError);
    
    return () => {
      window.removeEventListener('error', handleMapsError);
    };
  }, []);

  // If there's a Maps API error, show a helpful error page
  if (mapsError === "ApiNotActivatedMapError") {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "#d93025" }}>Google Maps API Error</h1>
        
        <div style={{ backgroundColor: "#f8f9fa", borderLeft: "4px solid #d93025", padding: "15px", marginBottom: "20px" }}>
          <h2>Places API Not Activated</h2>
          <p>The Places API is not enabled for this project. This API is required to find nearby parking lots.</p>
        </div>
        
        <div style={{ backgroundColor: "#e8f0fe", borderLeft: "4px solid #1a73e8", padding: "15px", marginBottom: "20px" }}>
          <h2>How to Fix This Error</h2>
          <p>To resolve this issue, you need to enable the Places API in your Google Cloud Console:</p>
          
          <ol style={{ marginLeft: "20px" }}>
            <li>Go to the <a href="https://console.cloud.google.com/apis/library" target="_blank">Google Cloud Console API Library</a></li>
            <li>Search for "Places API"</li>
            <li>Click on "Places API" in the results</li>
            <li>Click the "ENABLE" button</li>
            <li>Wait a few minutes for the changes to take effect</li>
          </ol>
          
          <p><strong>Note:</strong> Make sure you're using the same project that contains your Maps JavaScript API key.</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#1a73e8",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // If there's a Maps API error, show a helpful error page
  if (mapsError === "RefererNotAllowedMapError") {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "#d93025" }}>Google Maps API Error</h1>
        
        <div style={{ backgroundColor: "#f8f9fa", borderLeft: "4px solid #d93025", padding: "15px", marginBottom: "20px" }}>
          <h2>RefererNotAllowedMapError</h2>
          <p>The domain you're using is not authorized to use this Google Maps API key.</p>
          <p>Your current domain: <code>{window.location.origin}</code></p>
        </div>
        
        <div style={{ backgroundColor: "#e8f0fe", borderLeft: "4px solid #1a73e8", padding: "15px", marginBottom: "20px" }}>
          <h2>How to Fix This Error</h2>
          <p>To resolve this issue, add your domain to the authorized referrers in the Google Cloud Console:</p>
          
          <ol style={{ marginLeft: "20px" }}>
            <li>Go to the <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank">Google Cloud Console Credentials page</a></li>
            <li>Select the project that contains your Google Maps API key</li>
            <li>Find your API key in the list and click on it to edit</li>
            <li>Under "Application restrictions", select "HTTP referrers (web sites)"</li>
            <li>
              Add these domains to the list of authorized referrers:
              <pre style={{ backgroundColor: "#f1f3f4", padding: "15px", borderRadius: "4px", overflow: "auto" }}>
                {window.location.origin}/*{"\n"}
                {window.location.origin.replace('https://', 'http://')}/*{"\n"}
                {window.location.origin}/{"\n"}
                {window.location.origin.replace('https://', 'http://')}/
              </pre>
            </li>
            <li>Click "Save" to apply the changes</li>
          </ol>
          
          <p><strong>Note:</strong> It may take a few minutes for the changes to take effect.</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#1a73e8",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // If there's a different Maps API error, show a generic error message
  if (mapsError) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "#d93025" }}>Google Maps API Error</h1>
        <p>There was an error loading the Google Maps API: {mapsError}</p>
        <p>Please check your API key and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#1a73e8",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Render the map once the user location is available
  return (
    <APIProvider
      apiKey={getMapsApiKey()}
      library={["places"]}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      {userLocation ? (
        <div style={{ height: "100vh", width: "100%" }}>
          <Map
            defaultCenter={userLocation}
            defaultZoom={14}
            mapId={"DEMO_MAP_ID"}
            onCameraChanged={(ev: { detail: MapCameraChangedEvent }) => 
              console.log("Camera changed:", ev.detail)
            }
          >
            <AdvancedMarker position={userLocation}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#4285F4",
                  border: "2px solid #FFF",
                }}
              />
            </AdvancedMarker>
            <ParkingLots userLocation={userLocation} />
          </Map>
        </div>
      ) : (
        <NoLocationFound />
      )}
    </APIProvider>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
