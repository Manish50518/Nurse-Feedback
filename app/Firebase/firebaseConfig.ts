// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSPUiH8CN7usqRgPDCKpvpns3o2g-6yVM",
  authDomain: "nurse-feedback.firebaseapp.com",
  projectId: "nurse-feedback",
  storageBucket: "nurse-feedback.firebasestorage.app",
  messagingSenderId: "371999369565",
  appId: "1:371999369565:web:e5e8ce6719b90566d4a0b4",
  measurementId: "G-NW727FQTMN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

export { app, db };
