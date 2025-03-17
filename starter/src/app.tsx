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

// Get environment variables from window.env or import.meta.env
const getEnv = (key: string): string => {
  if (window.env && window.env[key]) {
    return window.env[key];
  }
  return import.meta.env[key] || "";
};

// Log environment variables for debugging
console.log('Maps API Key from env:', getEnv('VITE_MAPS_API_KEY'));

const App = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [mapsError, setMapsError] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [errorType, setErrorType] = useState<string>("");
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

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

    // Add a global error handler for Google Maps
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Google Maps JavaScript API') || 
          errorMessage.includes('InvalidKeyMapError') ||
          errorMessage.includes('RefererNotAllowedMapError')) {
        setMapsError(true);
        
        // Extract more detailed error information
        if (errorMessage.includes('RefererNotAllowedMapError')) {
          setErrorType("RefererNotAllowedMapError");
          setErrorDetails("The current domain is not authorized to use this Google Maps API key. Please add this domain to the allowed referrers in the Google Cloud Console.");
        } else if (errorMessage.includes('InvalidKeyMapError')) {
          setErrorType("InvalidKeyMapError");
          setErrorDetails("The Google Maps API key is invalid or has expired.");
        } else {
          setErrorType("GoogleMapsError");
          setErrorDetails("There was an error loading Google Maps.");
        }
      }
      originalConsoleError.apply(console, args);
    };

    // Add a global error handler for uncaught errors
    const handleUncaughtError = (event) => {
      if (event.error && !isMapLoaded) {
        const errorMessage = event.error.toString();
        if (errorMessage.includes('Cannot read properties of undefined') || 
            errorMessage.includes('getRootNode') ||
            errorMessage.includes('hasAttribute')) {
          // These errors are likely related to the Maps API failing to load
          event.preventDefault();
          if (!mapsError) {
            setMapsError(true);
            setErrorType("GoogleMapsError");
            setErrorDetails("There was an error loading Google Maps components.");
          }
        }
      }
    };

    window.addEventListener('error', handleUncaughtError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleUncaughtError);
    };
  }, [isMapLoaded, mapsError]);

  const handleCameraChange = (ev: { detail: MapCameraChangedEvent }) => {
    console.log(
      "camera changed:",
      ev.detail.center,
      "zoom:",
      ev.detail.zoom
    );
  };

  // Get the API key from environment variables
  const mapsApiKey = getEnv('VITE_MAPS_API_KEY');

  // Render detailed error UI for RefererNotAllowedMapError
  if (mapsError && errorType === "RefererNotAllowedMapError") {
    return (
      <div style={{ 
        padding: "20px", 
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        color: "#333",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        <h1 style={{ color: "#d93025" }}>Google Maps API Error</h1>
        
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          borderLeft: "4px solid #d93025", 
          padding: "15px", 
          marginBottom: "20px" 
        }}>
          <h2>RefererNotAllowedMapError</h2>
          <p>This error occurs when the domain you're using to access the Google Maps JavaScript API is not authorized in the Google Cloud Console.</p>
          <p>Your current domain: <code style={{ 
            backgroundColor: "#f1f3f4", 
            padding: "2px 4px", 
            borderRadius: "4px", 
            fontFamily: "monospace" 
          }}>{window.location.origin}</code></p>
        </div>
        
        <div style={{ 
          backgroundColor: "#e8f0fe", 
          borderLeft: "4px solid #1a73e8", 
          padding: "15px", 
          marginBottom: "20px" 
        }}>
          <h2>How to Fix This Error</h2>
          <p>To resolve this issue, you need to add your domain to the list of authorized referrers in the Google Cloud Console:</p>
          
          <ol style={{ marginLeft: "20px" }}>
            <li>Go to the <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" style={{ color: "#1a73e8" }}>Google Cloud Console Credentials page</a></li>
            <li>Select the project that contains your Google Maps API key</li>
            <li>Find your API key in the list and click on it to edit</li>
            <li>Under "Application restrictions", select "HTTP referrers (web sites)"</li>
            <li>Add your domain to the list of authorized referrers. For example:
              <pre style={{ 
                backgroundColor: "#f1f3f4", 
                padding: "15px", 
                borderRadius: "4px", 
                overflowX: "auto" 
              }}>{window.location.origin + '/*'}</pre>
            </li>
            <li>Click "Save" to apply the changes</li>
          </ol>
          
          <p><strong>Note:</strong> It may take a few minutes for the changes to take effect.</p>
        </div>
        
        <p>After adding your domain to the authorized referrers, you can reload the application:</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            display: "inline-block",
            backgroundColor: "#1a73e8",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  // Fallback UI when Maps API fails to load (for other errors)
  if (mapsError) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        maxWidth: "600px", 
        margin: "0 auto",
        fontFamily: "Arial, sans-serif"
      }}>
        <h2>Google Maps could not be loaded</h2>
        <p>{errorDetails || "We're having trouble loading the map."}</p>
        
        <p>This could be due to:</p>
        <ul style={{ textAlign: "left" }}>
          <li>An invalid or missing Google Maps API key</li>
          <li>The current domain not being authorized for this API key</li>
          <li>Network connectivity issues</li>
          <li>Temporary service disruption</li>
        </ul>
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "5px", 
          marginTop: "20px",
          textAlign: "left" 
        }}>
          <p><strong>For developers:</strong></p>
          <p>If you're seeing a "RefererNotAllowedMapError", you need to add this domain to the allowed referrers in the Google Cloud Console:</p>
          <code style={{ 
            display: "block", 
            padding: "10px", 
            backgroundColor: "#e9ecef", 
            borderRadius: "4px",
            wordBreak: "break-all"
          }}>
            {window.location.origin}
          </code>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: "10px 20px",
            backgroundColor: "#34A853",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "20px"
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={mapsApiKey}
      library={["places"]}
      onLoad={() => {
        console.log("Maps API has loaded.");
        setIsMapLoaded(true);
      }}
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