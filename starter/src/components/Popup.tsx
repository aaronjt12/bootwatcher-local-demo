import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';

type PopupProps = {
  poi: { name?: string }; // The name of the parking lot is used for querying the database
  onClose: () => void;
  onReceiveNotifications: () => void;
  onSendNotification: () => void;
};

const Popup: React.FC<PopupProps> = ({ poi, onClose, onReceiveNotifications, onSendNotification }) => {
  const [notificationCount, setNotificationCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (!poi.name) {
          setNotificationCount(0); // If no parking lot is selected, default to 0
          return;
        }

        // Initialize Firebase Database
        const db = getDatabase();
        const notificationsRef = ref(db, 'phoneNumbers');

        // Query for entries where parkingLot matches the selected one
        const notificationsQuery = query(notificationsRef, orderByChild('parkingLot'), equalTo(poi.name));

        // Fetch data
        const snapshot = await get(notificationsQuery);
        if (snapshot.exists()) {
          setNotificationCount(Object.keys(snapshot.val()).length); // Count matching entries
        } else {
          setNotificationCount(0); // Default to 0 if no data exists
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
        setNotificationCount(0); // Fallback to 0 on error
      }
    };

    fetchNotificationCount();
  }, [poi.name]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '16px',
        zIndex: 1000,
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        {poi.name || 'Parking Lot'}
      </h3>
      <button
        onClick={onReceiveNotifications}
        style={{
          marginRight: '8px',
          padding: '8px 16px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Receive Notifications
      </button>
      <button
        onClick={onSendNotification}
        style={{
          marginRight: '8px',
          padding: '8px 16px',
          backgroundColor: '#28A745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Send Notification
      </button>
      <button
        onClick={onClose}
        style={{
          padding: '8px 16px',
          backgroundColor: '#DC3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#555' }}>
        {notificationCount !== null
          ? `Total Notifications Sent: ${notificationCount}`
          : 'Loading notifications...'}
      </div>
    </div>
  );
};

export default Popup;
