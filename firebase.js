import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey:
  "YOUR_API_KEY",

  authDomain:
  "voxfixai.firebaseapp.com",

  projectId:
  "voxfixai",

  storageBucket:
  "voxfixai.appspot.com",

  messagingSenderId:
  "404386559379",

  appId:
  "1:404386559379:web:f64198cea1920a3bfae466"

};

const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);

export const db =
getFirestore(app);