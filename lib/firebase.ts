import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Add this
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATdALohmTrgNg7ZBEcZXchpFMaPpqPjc4",
  authDomain: "goosetriager-a448a.firebaseapp.com",
  projectId: "goosetriager-a448a",
  storageBucket: "goosetriager-a448a.firebasestorage.app",
  messagingSenderId: "501766552173",
  appId: "1:501766552173:web:81c5f49c130c1ddb55dd64",
  measurementId: "G-FFPXQBN66K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app); // Export this for the login page

// Initialize Firestore with the Long Polling fix
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
});