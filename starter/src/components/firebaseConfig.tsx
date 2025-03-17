import { initializeApp } from 'firebase/app';

// Use import.meta.env for Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bootwatcher-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bootwatcher-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bootwatcher-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bootwatcher-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
