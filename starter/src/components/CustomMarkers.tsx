import React, { useEffect, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
} from "firebase/database";

// Firebase configuration (reuse your existing configuration)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Define the Poi type
type Poi = {
  key: string;
  location: {
    lat: number;
    lng: number;
  };
  name?: string;
};

const CustomMarkers = () => {
  const map = useMap();
  const [customMarkers, setCustomMarkers] = useState<Poi[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  // Add custom marker on map click
  useEffect(() => {
    if (!map || !isAddingMarker) return;

    const handleMapClick = (e) => {
      const newMarker = {
        key: `${Date.now()}`, // Unique key
        location: { lat: e.latLng.lat(), lng: e.latLng.lng() },
        name: "Custom Parking",
      };

      // Save custom marker to Firebase
      const markerRef = push(ref(database, "customMarkers"));
      set(markerRef, newMarker)
        .then(() => {
          setCustomMarkers((prev) => [...prev, newMarker]);
          alert("Custom parking marker added!");
          setIsAddingMarker(false); // Exit "Add Marker Mode"
        })
        .catch((error) => console.error("Error saving custom marker:", error));
    };

    map.addListener("click", handleMapClick);

    return () => {
      window.google.maps.event.clearListeners(map, "click");
    };
  }, [map, isAddingMarker]);

  // Load custom markers from Firebase
  useEffect(() => {
    const markersRef = ref(database, "customMarkers");
    get(markersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const markersData = Object.entries(snapshot.val()).map(([key, value]: [string, any]) => ({
            key,
            location: value.location,
            name: value.name,
          }));
          setCustomMarkers(markersData);
        }
      })
      .catch((error) => console.error("Error loading custom markers:", error));
  }, []);

  return (
    <>
      <button
        onClick={() => setIsAddingMarker(!isAddingMarker)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "10px 20px",
          backgroundColor: isAddingMarker ? "red" : "blue",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {isAddingMarker ? "Cancel Add Marker" : "Add Custom Marker"}
      </button>
      {customMarkers.map((marker) => (
        <AdvancedMarker
          key={marker.key}
          position={marker.location}
          clickable={true}
        >
          <img
            src={"/images/parking_7723653.png"}
            width={34}
            height={34}
            title={marker.name}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default CustomMarkers;
