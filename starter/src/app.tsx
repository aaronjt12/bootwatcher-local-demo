import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import ParkingLots from "./components/ParkingLots";
import NoLocationFound from "./components/NoLocationFound";

type Location = { lat: number; lng: number };

// Updated interface with correct bounds type
interface MapCameraChangedEvent {
  center: google.maps.LatLngLiteral;
  zoom: number;
  bounds: google.maps.LatLngBounds | null;
}

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
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_MAPS_API_KEY}
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
          <ParkingLots userLocation={userLocation} />
        </Map>
      ) : (
        <NoLocationFound />
      )}
    </APIProvider>
  );
};

export default App;

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("Could not find element with id 'app'");
}
const root = createRoot(appElement);
root.render(<App />);