import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import ParkingLots from "./components/ParkingLots";
import NoLocationFound from "./components/NoLocationFound";



// Map Page Component (Protected)
const MapPage = () => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);
 

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



  return (
    <div className="app-container">
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



// Main App Component with Routing
export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
    </Routes>
  );
};

// Root Component with Auth0 Provider
const RootApp = () => (
    <BrowserRouter>
      <App />
    </BrowserRouter>
);

// Render the App
const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Element with id 'app' not found in the DOM");
}
const root = createRoot(appElement);
root.render(<RootApp />);


