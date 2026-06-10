import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBq0LjdCOXHBrH0EHSrW5drAjiVVaVPASg",
  authDomain: "bhargav-reddy-c7ff1.firebaseapp.com",
  projectId: "bhargav-reddy-c7ff1",
  storageBucket: "bhargav-reddy-c7ff1.firebasestorage.app",
  messagingSenderId: "1057897789900",
  appId: "1:1057897789900:web:a020e3502783bc28f28569",
  measurementId: "G-1VXFQZG3VV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
