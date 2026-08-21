// ================================================================
// FIXMYBLOCK NEPAL - FIREBASE CONFIGURATION
// ================================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

// 🔴 REPLACE WITH YOUR FIREBASE CONFIG
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVvWlYUCOfALhtWdR53_ZcP5spTYhDyu8",
  authDomain: "fixmyblock-nepal.firebaseapp.com",
  projectId: "fixmyblock-nepal",
  storageBucket: "fixmyblock-nepal.firebasestorage.app",
  messagingSenderId: "742804276117",
  appId: "1:742804276117:web:ddab9eeff9a357c1112c9c",
  measurementId: "G-C3RQER0PC1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);