import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSxkCO3TNNf2UxJk53IqyrsUOHQBQDj8g",
  authDomain: "jumpr-vpn.firebaseapp.com",
  databaseURL: "https://jumpr-vpn-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "jumpr-vpn",
  storageBucket: "jumpr-vpn.firebasestorage.app",
  messagingSenderId: "834768996230",
  appId: "1:834768996230:web:5900bb81a6382a98a88e07",
  measurementId: "G-L90TYM8123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
export const auth = getAuth(app);
