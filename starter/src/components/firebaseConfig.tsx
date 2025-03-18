import { initializeApp } from 'firebase/app';

// Get environment variables from window.env or import.meta.env
const getEnv = (key: string): string => {
  return import.meta.env[key] || "";
};

// Use environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),rtdb
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
