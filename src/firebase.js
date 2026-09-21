// Import Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWCRWzCI_ifsYUfKFCPXnkGYkewFGcaDw",
  authDomain: "studentassist-fa9a2.firebaseapp.com",
  projectId: "studentassist-fa9a2",
  storageBucket: "studentassist-fa9a2.firebasestorage.app",
  messagingSenderId: "1037835224108",
  appId: "1:1037835224108:web:80ebe32624d5254384bd89",
  measurementId: "G-TGVRLFCL86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Analytics
const analytics = getAnalytics(app);

// Firebase Authentication
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);