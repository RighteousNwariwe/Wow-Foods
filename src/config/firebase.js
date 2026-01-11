// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS6rDmHaCoAqbJuLlka5WDFboqU6Chz2U",
  authDomain: "wow-foods-5edc4.firebaseapp.com",
  databaseURL: "https://wow-foods-5edc4-default-rtdb.firebaseio.com",
  projectId: "wow-foods-5edc4",
  storageBucket: "wow-foods-5edc4.firebasestorage.app",
  messagingSenderId: "849612730302",
  appId: "1:849612730302:web:c3d55d9f58234bb8ab13ef",
  measurementId: "G-3VJWN4C368"
};

// Initialize Firebase
let app, analytics, database;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app, analytics, database };
