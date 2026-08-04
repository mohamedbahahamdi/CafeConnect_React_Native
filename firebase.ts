import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4srBe7Fq-BRPQtsom2toB828e7FvUOWg",
  authDomain: "cafeconnect2-3b255.firebaseapp.com",
  projectId: "cafeconnect2-3b255",
  storageBucket: "cafeconnect2-3b255.firebasestorage.app",
  messagingSenderId: "143424001315",
  appId: "1:143424001315:web:bf709ba84848adc4e4e896",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
