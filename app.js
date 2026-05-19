import {
  auth,
  db
}
from "./firebase.js";

import {
  buildPrompt
}
from "./aiModes.js";

import {
  transcribeAudio
}
from "./transcribeAudio.js";

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

const usesCount =
document.getElementById("usesCount");

const loading =
document.getElementById("loading");

const historyBox =
document.getElementById("history");

const result =
document.getElementById("result");

const fixBtn =
document.getElementById("fixBtn");

onAuthStateChanged(auth, async(user)=>{

  if(user){

    currentUser = user;

    fixBtn.disabled = false;

    const userRef =
    doc(db,"users",user.uid);

    const snap =
    await getDoc(userRef);

    if(snap.exists()){

      const data =
      snap.data();

      usesCount.innerText =
      data.freeUses || 3;

      loadHistory(
        data.history || []
      );

    }

  }

});

function loadHistory(history){

  historyBox.innerHTML = "";

  history.reverse().forEach(item=>{

    historyBox.innerHTML += `

    <div class="history-item">

      <div class="history-tone">
        ${item.detectedIntent}
      </div>

      <div>
        ${item.result}
      </div>

    </div>

    `;

  });

}

function renderReplies(replies){

  const grid =
  document.getElementById("replyGrid");

  grid.innerHTML = "";

  replies.forEach(reply=>{

    grid.innerHTML += `

    <div
    class="reply-card"
    onclick="copyReply(
      \`${reply}\`
    )">

      ${reply}

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

async function fixMessage(){

  const text =
  document.getElementById("inputText").value;

  const voiceFile =
  document.getElementById("voiceFile")
  .files[0];

  if(!currentUser){

    result.innerHTML =
    "Connecting to VoxFix AI...";

    return;

  }

  if(!text && !voiceFile){

    result.innerHTML =
    "Enter a message or upload a voice note.";

    return;

  }

  loading.style.display =
  "block";

  result.innerHTML = "";

  try{

    let finalText = text;

    if(voiceFile){

      const audioBase64 =
      await fileToBase64(
        voiceFile
      );

      result.innerHTML =
      "Transcribing voice note...";

      const transcript =
      await transcribeAudio(
        audioBase64
      );

      finalText = transcript;

    }

    const instruction =
    buildPrompt(finalText);

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

          text:finalText,

          instruction

        })

      }
    );

    const ai =
    await response.json();

    renderReplies(
      ai.replies || []
    );

    result.innerHTML = `

    <div style="
    color:#22c55e;
    margin-bottom:15px;
    font-weight:bold;
    ">

    ${ai.intent}

    </div>

    ${ai.result}

    `;

    const userRef =
    doc(db,"users",currentUser.uid);

    await updateDoc(userRef,{

      freeUses:
      increment(-1),

      history:
      arrayUnion({

        detectedIntent:
        ai.intent,

        result:
        ai.result,

        createdAt:
        Date.now()

      })

    });

    const latest =
    await getDoc(userRef);

    usesCount.innerText =
    latest.data().freeUses;

  }catch(error){

    console.log(error);

    result.innerHTML =
    "AI request failed.";

  }

  loading.style.display =
  "none";

}

async function analyzeConversation(){

  const text =
  document.getElementById("inputText").value;

  if(!text){

    result.innerHTML =
    "Paste a conversation first.";

    return;

  }

  loading.style.display =
  "block";

  result.innerHTML =
  "Analyzing conversation...";

  try{

    const response =
    await fetch(
      "/.netlify/functions/analyze",
      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          text

        })

      }
    );

    const data =
    await response.json();

    result.innerHTML = `

    <div style="
    line-height:2;
    ">

    <h3>
    Conversation Analysis
    </h3>

    <b>Detected Mood:</b>
    <br>
    ${data.mood}

    <br><br>

    <b>Situation:</b>
    <br>
    ${data.situation}

    <br><br>

    <b>Best Strategy:</b>
    <br>
    ${data.strategy}

    <br><br>

    <b>Suggested Reply:</b>
    <br>
    ${data.reply}

    </div>

    `;

  }catch(error){

    console.log(error);

    result.innerHTML =
    "Analysis failed.";

  }

  loading.style.display =
  "none";

}

window.fixMessage =
fixMessage;

window.analyzeConversation =
analyzeConversation;

window.copyResult =
function(){

  navigator.clipboard
  .writeText(
    result.innerText
  );

  alert("Copied");

}

window.copyReply =
function(text){

  navigator.clipboard
  .writeText(text);

  alert("Reply copied");

}

window.shareWhatsApp =
function(){

  const text =
  result.innerText;

  const url =
  `https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url,"_blank");

}

window.upgradeNow =
function(){

  window.location.href =
  "pricing.html";

}

window.openAuth =
function(){

  window.location.href =
  "auth.html";

}