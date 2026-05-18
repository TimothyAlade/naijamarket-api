import {
  auth,
  db
}
from "./firebase.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

const PAYSTACK_PUBLIC_KEY =
"pk_live_9aa6ef8ab901b849ee1723345ff12bbef8162359";

const usesCount =
document.getElementById("usesCount");

const loading =
document.getElementById("loading");

const historyBox =
document.getElementById("history");

onAuthStateChanged(auth, async(user)=>{

  if(user){

    currentUser = user;

    const userRef =
    doc(db,"users",user.uid);

    const snap =
    await getDoc(userRef);

    const data =
    snap.data();

    usesCount.innerText =
    data.freeUses;

    loadHistory(data.history || []);

  }

});

function loadHistory(history){

  historyBox.innerHTML = "";

  history.reverse().forEach(item=>{

    historyBox.innerHTML += `
      <div class="history-item">

        <div class="history-tone">
          ${item.tone}
        </div>

        <div>
          ${item.result}
        </div>

      </div>
    `;

  });

}

async function fileToBase64(file){

  return new Promise((resolve,reject)=>{

    const reader =
    new FileReader();

    reader.readAsDataURL(file);

    reader.onload = ()=>{

      const base64 =
      reader.result.split(",")[1];

      resolve(base64);

    };

    reader.onerror =
    error=>reject(error);

  });

}

function getModeInstruction(tone){

  const modes = {

    "Professional":
    "Rewrite professionally and clearly.",

    "Respectful":
    "Make the message respectful and polite.",

    "Client Reply":
    "Rewrite like a smart client response.",

    "Pidgin to English":
    "Convert pidgin English into fluent English.",

    "Fix Grammar":
    "Fix grammar mistakes naturally.",

    "Short & Clear":
    "Shorten the message while keeping meaning.",

    "Sound Smarter":
    "Rewrite intelligently and confidently.",

    "Romantic":
    "Rewrite warmly and emotionally.",

    "CEO Style":
    "Rewrite like a confident CEO speaking professionally.",

    "Luxury English":
    "Rewrite elegantly with premium sounding English.",

    "Elite Business":
    "Rewrite like high level business communication.",

    "High Value Texting":
    "Rewrite confidently, attractively, and socially intelligent.",

    "Premium Client Pitch":
    "Rewrite like a persuasive premium business pitch."

  };

  return modes[tone] ||
  "Rewrite professionally.";

}

async function fixMessage(){

  const text =
  document.getElementById("inputText").value;

  const tone =
  document.getElementById("tone").value;

  const voiceFile =
  document.getElementById("voiceFile")
  .files[0];

  const result =
  document.getElementById("result");

  if(!currentUser){

    alert("Refresh page.");

    return;

  }

  if(!text && !voiceFile){

    alert(
      "Enter text or upload voice note."
    );

    return;

  }

  const userRef =
  doc(db,"users",currentUser.uid);

  const snap =
  await getDoc(userRef);

  const data =
  snap.data();

  const premiumTones = [

    "CEO Style",

    "Luxury English",

    "Elite Business",

    "High Value Texting",

    "Premium Client Pitch"

  ];

  const isPremium =
  data?.premium || false;

  if(
    premiumTones.includes(tone)
    &&
    !isPremium
  ){

    result.innerHTML = `
      🔒 Premium tone locked.
      <br><br>
      Upgrade to unlock smarter AI modes.
    `;

    return;

  }

  if(data.freeUses <= 0){

    result.innerHTML =
    "Free daily limit reached.";

    return;

  }

  loading.style.display =
  "block";

  result.innerHTML = "";

  try{

    let audioBase64 = null;

    if(voiceFile){

      audioBase64 =
      await fileToBase64(voiceFile);

    }

    const modeInstruction =
    getModeInstruction(tone);

    const response =
    await fetch(
      "/.netlify/functions/fix",
      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          text,
          tone,
          audio:audioBase64,
          instruction:modeInstruction
        })

      }
    );

    const ai =
    await response.json();

    const detectedLanguage =
    ai.detectedLanguage || "Unknown";

    typeWriter(ai.result);

    function typeWriter(text){

      result.innerHTML = `
      <strong>${tone}</strong>
      <br>
      <small>
      Detected Language:
      ${detectedLanguage}
      </small>
      <br><br>
      `;

      let i = 0;

      const speed = 15;

      function typing(){

        if(i < text.length){

          result.innerHTML +=
          text.charAt(i);

          i++;

          setTimeout(
            typing,
            speed
          );

        }

      }

      typing();

    }

    await updateDoc(userRef,{

      freeUses:
      increment(-1),

      history:
      arrayUnion({

        tone,

        result:
        ai.result,

        language:
        detectedLanguage,

        createdAt:
        Date.now()

      })

    });

    usesCount.innerText =
    data.freeUses - 1;

    loadHistory([
      ...(data.history || []),

      {
        tone,
        result: ai.result
      }

    ]);

  }catch(error){

    result.innerHTML =
    "Something went wrong.";

    console.log(error);

  }

  loading.style.display =
  "none";

}

window.fixMessage =
fixMessage;

window.copyResult =
function(){

  const text =
  document.getElementById("result")
  .innerText;

  navigator.clipboard
  .writeText(text);

  alert("Copied");

}

window.shareWhatsApp =
function(){

  const text =
  document.getElementById("result")
  .innerText;

  const url =
  `https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url,"_blank");

}

window.upgradeNow =
function(){

  window.location.href =
  "pricing.html";

}