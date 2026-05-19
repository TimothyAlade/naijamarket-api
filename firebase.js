import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getAuth,
  signInAnonymously,
  onAuthStateChanged

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  getFirestore,
  doc,
  getDoc,
  setDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey:
  "AIzaSyC_JYCC1knmCa4Q8GTbKQxLSJ_Mn16oZmU",

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

const auth =
getAuth(app);

const db =
getFirestore(app);

async function createUser(user){

  const userRef =
  doc(db,"users",user.uid);

  const snap =
  await getDoc(userRef);

  if(!snap.exists()){

    await setDoc(userRef,{

      uid:user.uid,

      premium:false,

      freeUses:3,

      lastReset:
      Date.now(),

      createdAt:
      Date.now(),

      history:[]

    });

  }

}

signInAnonymously(auth)
.then(()=>{

  console.log(
    "Anonymous login success"
  );

})
.catch((error)=>{

  console.log(
    "Anonymous auth error:",
    error
  );

});

onAuthStateChanged(
  auth,
  async(user)=>{

    if(user){

      console.log(
        "User authenticated:",
        user.uid
      );

      await createUser(user);

    }

  }
);

export {
  auth,
  db
};