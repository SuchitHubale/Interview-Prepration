import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBgTdReGZgLacAvYkpMaD_Fqg285_W4qOU",
  authDomain: "interviewprep-e5bf5.firebaseapp.com",
  projectId: "interviewprep-e5bf5",
  storageBucket: "interviewprep-e5bf5.firebasestorage.app",
  messagingSenderId: "854512992396",
  appId: "1:854512992396:web:aa0c6fcdccdac042c73ba9",
  measurementId: "G-1W8BF32SXK"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();