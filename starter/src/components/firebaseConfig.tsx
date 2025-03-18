import { initializeApp } from 'firebase/app';

// Get environment variables from window.env or import.meta.env
const getEnv = (key: string): string => {
  return import.meta.env[key] || "";
};

// Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "bootwatcher-demo.firebaseapp.com",
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL') || "https://bootwatcher-demo-default-rtdb.firebaseio.com",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || "bootwatcher-demo",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "bootwatcher-demo.appspot.com",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "123456789012",
  appId: getEnv('VITE_FIREBASE_APP_ID') || "1:123456789012:web:abc123def456",
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
