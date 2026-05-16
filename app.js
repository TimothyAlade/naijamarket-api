import {
  auth,
  db
} from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function fixMessage() {

  const text = document.getElementById("inputText").value;
  const tone = document.getElementById("tone").value;
  const result = document.getElementById("result");

  const user = auth.currentUser;

  if(!user){
    alert("Loading user...");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  const snap = await getDoc(userRef);

  const data = snap.data();

  if(data.freeUses <= 0){

    result.innerHTML = `
      Free limit reached.<br><br>
      Upgrade to continue using VoxFix AI.
    `;

    return;
  }

  result.innerHTML = "Fixing message...";

  try {

    const response = await fetch("/.netlify/functions/fix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        tone
      })
    });

    const ai = await response.json();

    result.innerHTML = `
      <strong>${tone} Version:</strong>
      <br><br>
      ${ai.result}
    `;

    await updateDoc(userRef, {
      freeUses: increment(-1)
    });

  } catch(error){

    result.innerHTML = "Something went wrong.";

  }

}

window.fixMessage = fixMessage;