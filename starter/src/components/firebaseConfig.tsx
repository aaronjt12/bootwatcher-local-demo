import { initializeApp } from 'firebase/app';

// Use import.meta.env for Vite environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0",
  authDomain: "bootwatcher-demo.firebaseapp.com",
  databaseURL: "https://bootwatcher-demo-default-rtdb.firebaseio.com",
  projectId: "bootwatcher-demo",
  storageBucket: "bootwatcher-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
