import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATdALohmTrgNg7ZBEcZXchpFMaPpqPjc4",
  authDomain: "goosetriager-a448a.firebaseapp.com",
  projectId: "goosetriager-a448a",
  storageBucket: "goosetriager-a448a.firebasestorage.app",
  messagingSenderId: "501766552173",
  appId: "1:501766552173:web:81c5f49c130c1ddb55dd64",
  measurementId: "G-FFPXQBN66K"
};

const app = initializeApp(firebaseConfig);

// THIS IS THE FIX: Initialize Firestore with Long Polling enabled
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
});