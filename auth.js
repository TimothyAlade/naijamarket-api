import {
  auth,
  db
}
from "./firebase.js";

import {

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  GoogleAuthProvider,

  signInWithPopup,

  onAuthStateChanged,

  signOut

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  doc,

  setDoc,

  getDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider =
new GoogleAuthProvider();

window.signup =
async function(){

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  try{

    const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user =
    userCredential.user;

    await setDoc(
      doc(db,"users",user.uid),
      {

        email,

        freeUses:3,

        premium:false,

        createdAt:Date.now(),

        history:[]

      }
    );

    window.location.href =
    "index.html";

  }catch(error){

    alert(error.message);

  }

}

window.login =
async function(){

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  try{

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    window.location.href =
    "index.html";

  }catch(error){

    alert(error.message);

  }

}

window.googleLogin =
async function(){

  try{

    const result =
    await signInWithPopup(
      auth,
      provider
    );

    const user =
    result.user;

    const userRef =
    doc(db,"users",user.uid);

    const snap =
    await getDoc(userRef);

    if(!snap.exists()){

      await setDoc(userRef,{

        email:user.email,

        freeUses:3,

        premium:false,

        createdAt:Date.now(),

        history:[]

      });

    }

    window.location.href =
    "index.html";

  }catch(error){

    alert(error.message);

  }

}

window.logout =
async function(){

  await signOut(auth);

  window.location.href =
  "login.html";

}

onAuthStateChanged(auth,(user)=>{

  const protectedPages = [

    "/index.html"

  ];

  const path =
  window.location.pathname;

  if(
    protectedPages.includes(path)
    &&
    !user
  ){

    window.location.href =
    "login.html";

  }

});