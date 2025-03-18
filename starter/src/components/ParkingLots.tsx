import React, { useEffect, useState, useCallback } from "react";
import {
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import axios from "axios";

// Firebase configuration with correct environment variable names
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bootwatcher-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bootwatcher-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "HIDDEN" : undefined,
});

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

// Twilio configuration
const TWILIO_URL = `${import.meta.env.VITE_BACKEND_URL}/send-sms`;

// Define types for Places API
interface PlacesSearchResult {
  place_id: string;
  name?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  formatted_address?: string;
  rating?: number;
  opening_hours?: {
    isOpen: () => boolean;
  };
}

interface PlacesSearchResponse {
  results: PlacesSearchResult[];
  pagination?: {
    hasNextPage: boolean;
    nextPage: () => void;
  };
}

// ParkingLots Component
const ParkingLots = ({ userLocation }) => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [parkingLots, setParkingLots] = useState<Poi[]>([]);
  const [customMarkers, setCustomMarkers] = useState<Poi[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch nearby parking lots
  useEffect(() => {
    if (!placesLib || !map || !userLocation) return;

    let isComponentMounted = true;

    const fetchParkingLots = async () => {
      try {
        // Log initialization state
        console.log("Places API State:", {
          placesLib: !!placesLib,
          map: !!map,
          userLocation,
          apiKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        });

        // Create a Places service instance
        const service = new placesLib.PlacesService(map);

        // Define the search request using the new Places API format
        const request = {
          locationBias: {
            circle: {
              center: { lat: userLocation.lat, lng: userLocation.lng },
              radius: 3000 // 3km radius
            }
          },
          types: ['parking'],
          fields: ['place_id', 'name', 'geometry', 'formatted_address', 'rating', 'opening_hours'],
          language: 'en'
        };

        // Log the request
        console.log("Places API Request:", {
          locationBias: request.locationBias,
          types: request.types,
          fields: request.fields
        });

        // Use Promise wrapper for better error handling
        const searchNearbyPlaces = (): Promise<PlacesSearchResponse> => {
          return new Promise((resolve, reject) => {
            service.search(
              request,
              (results, status, pagination) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  resolve({ results, pagination });
                } else {
                  reject(new Error(`Places API Error: ${status}`));
                }
              }
            );
          });
        };

        const { results } = await searchNearbyPlaces();

        // Log the response
        console.log("Places API Response:", {
          status: "OK",
          resultsCount: results.length,
          firstResult: results[0]
        });

        if (!isComponentMounted) return;

        const locations: Poi[] = results.map((place) => ({
          key: place.place_id,
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
          name: place.name || "Parking Lot",
          address: place.formatted_address,
          rating: place.rating,
          isOpen: place.opening_hours?.isOpen(),
        }));

        setParkingLots(locations);
        setSearchError(null);
        setDebugInfo(null);

      } catch (error: unknown) {
        if (!isComponentMounted) return;
        
        console.error("Error during nearby search:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('REQUEST_DENIED')) {
          setSearchError("Access to Places API was denied");
          setDebugInfo(`
            Possible issues:
            1. API key restrictions (check HTTP referrers)
            2. Billing not enabled
            3. API activation still propagating
            4. API key not having Places API permission
          `);
        } else if (errorMessage.includes('ZERO_RESULTS')) {
          setSearchError("No parking lots found in this area");
          setParkingLots([]);
        } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
          setSearchError("Search limit exceeded. Please try again later.");
          setDebugInfo("Check your API usage quotas in Google Cloud Console");
        } else {
          setSearchError("Failed to search for parking lots");
          setDebugInfo(`Error details: ${errorMessage}`);
        }
        setShowErrorDetails(true);
      }
    };

    fetchParkingLots();

    return () => {
      isComponentMounted = false;
    };
  }, [placesLib, map, userLocation]);

  // Update Poi type to include new fields
  type ExtendedPoi = Poi & {
    address?: string;
    rating?: number;
    isOpen?: boolean;
  };

  // Show error message if search failed
  if (searchError) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
        maxWidth: '500px',
        width: '90%'
      }}>
        <p style={{ margin: '0 0 10px 0', color: '#d93025', fontWeight: 'bold' }}>{searchError}</p>
        {showErrorDetails && debugInfo && (
          <div style={{ fontSize: '14px', color: '#5f6368' }}>
            <p style={{ margin: '0 0 8px 0' }}>Debug Information:</p>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              background: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {debugInfo}
            </pre>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
              Check the browser console for more detailed logs
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsAddingMarker(!isAddingMarker)}
        style={{
          position: "absolute",
          top: "20px",
          right: "2%",
          padding: "5px 5px",
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
      {parkingLots.length > 0 && <PoiMarkers pois={[...parkingLots, ...customMarkers]} />}
    </>
  );
};

// Popup Component
const Popup = ({
  poi,
  notificationCount,
  onClose,
  onReceiveNotifications,
  onSendNotification,
  onDeleteMarker,
}) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      border: "1px solid #ccc",
      padding: "16px",
      borderRadius: "8px",
      zIndex: 1000,
    }}
  >
    <h3>{poi.name || "Parking Lot"}</h3>
    <p>Cars booted in the last 7 days: {notificationCount}</p>
    <button
      onClick={onReceiveNotifications}
      style={{
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "8px",
      }}
    >
      Receive Notifications
    </button>
    <button
      onClick={onSendNotification}
      style={{
        padding: "8px 16px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "8px",
      }}
    >
      Send Notification
    </button>
    {/* Add delete button for custom markers */}
    {poi.name === "Custom Parking" && (
      <button
        onClick={() => {
          onDeleteMarker(poi.key); // Call delete function
          onClose(); // Close the popup after deletion
        }}
        style={{
          padding: "8px 16px",
          backgroundColor: "#dc3545", // Similar to Bootstrap danger button
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Delete Marker
      </button>
    )}
    <button
      onClick={onClose}
      style={{
        padding: "8px 16px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "8px",
      }}
    >
      Close
    </button>
  </div>
);

// Phone Number Input Popup
const PhoneNumberPopup = ({ onSave, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSave = () => {
    const phoneRegex = /^[0-9]{10}$/; // Adjust for international numbers if needed
    if (!phoneRegex.test(phoneNumber)) {
      alert("Please enter a valid phone number.");
      return;
    }
    onSave(phoneNumber);
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "16px",
        zIndex: 1000,
      }}
    >
      <h3>Enter Your Phone Number</h3>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Your phone number"
      />
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

// PoiMarkers Component
const PoiMarkers = (props: { pois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>(
    {}
  );
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleClick = useCallback((poi: Poi) => {
    setSelectedPoi(poi);

    const sevenDaysAgo = Date.now() - 604800000; // 7 days in milliseconds

    const phoneNumbersRef = query(
      ref(database, "phoneNumbers"),
      orderByChild("parkingLot"),
      equalTo(poi.name || "Unknown")
    );

    get(phoneNumbersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredData = Object.values(data).filter((entry: any) => {
            const entryTimestamp = new Date(entry.timestamp).getTime();
            return entryTimestamp >= sevenDaysAgo;
          });
          setNotificationCount(filteredData.length);
        } else {
          setNotificationCount(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching notification count:", error);
        setNotificationCount(0);
      });
  }, []);

  const handlePhoneSave = (phoneNumber) => {
    if (selectedPoi) {
      const timestamp = new Date().toISOString();
      const phoneData = {
        phoneNumber,
        parkingLot: selectedPoi.name || "Unknown",
        timestamp,
      };

      const newPhoneRef = push(ref(database, "phoneNumbers"));
      set(newPhoneRef, phoneData)
        .then(() => {
          console.log("Phone number saved successfully");
        })
        .catch((error) => {
          console.error("Error saving phone number:", error);
        });
    }
  };

  const handleSendNotification = () => {
    if (selectedPoi) {
      const phoneNumbersRef = query(
        ref(database, "phoneNumbers"),
        orderByChild("parkingLot"),
        equalTo(selectedPoi.name || "Unknown")
      );

      get(phoneNumbersRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const phoneNumbers = Object.values(data).map(
              (entry: any) => entry.phoneNumber
            );

            if (phoneNumbers.length === 0) {
              alert("No phone numbers found for this parking lot.");
              return;
            }

            axios
              .post(TWILIO_URL, {
                message: "Your car is being booted!",
                parkingLot: selectedPoi.name || "Unknown",
                phoneNumbers,
              })
              .then(() => {
                alert("Notification sent successfully!");
              })
              .catch((error) => {
                console.error("Error sending notification:", error);
              });
          } else {
            alert("No phone numbers found for this parking lot.");
          }
        })
        .catch((error) => {
          console.error("Error fetching phone numbers:", error);
        });
    }
  };

  const handleDelete = (key) => {
    const markerRef = ref(database, `customMarkers/${key}`);
    set(markerRef, null)
      .then(() => {
        alert("Custom marker deleted successfully");
        setMarkers((prev) => {
          const updatedMarkers = { ...prev };
          delete updatedMarkers[key];
          return updatedMarkers;
        });
      })
      .catch((error) => console.error("Error deleting marker:", error));
  };

  const setMarkerRef = (marker: google.maps.Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      {props.pois.map((poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={(marker) => setMarkerRef(marker, poi.key)}
          clickable={true}
          onClick={() => handleClick(poi)}
        >
          <div>
            <img
              src={
                poi.name === "Custom Parking"
                  ? "/images/parking_7723653.png"
                  : "/images/parking_7723653.png"
              }
              width={34}
              height={34}
              title={poi.name || "Parking lots"}
              alt={
                poi.name === "Custom Parking"
                  ? "Custom Marker"
                  : "Parking Lot Marker"
              }
            />
          </div>
        </AdvancedMarker>
      ))}
      {selectedPoi && (
        <Popup
          poi={selectedPoi}
          notificationCount={notificationCount}
          onClose={() => setSelectedPoi(null)}
          onReceiveNotifications={() => setShowPhonePopup(true)}
          onSendNotification={handleSendNotification}
          onDeleteMarker={handleDelete} // Pass delete function to Popup
        />
      )}
      {showPhonePopup && (
        <PhoneNumberPopup
          onSave={handlePhoneSave}
          onClose={() => setShowPhonePopup(false)}
        />
      )}
    </>
  );
};

export default ParkingLots;