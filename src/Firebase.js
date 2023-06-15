// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEb6FzG28H85_o3EGHKgUnlHLpCtH5u3g",
  authDomain: "auth-f8f7c.firebaseapp.com",
  projectId: "auth-f8f7c",
  storageBucket: "auth-f8f7c.appspot.com",
  messagingSenderId: "960990419977",
  appId: "1:960990419977:web:5baa893398863221762cd8",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
