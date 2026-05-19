export async function transcribeAudio(base64Audio){

  const response =
  await fetch(
    "/.netlify/functions/transcribe",
    {

      method:"POST",

      headers:{
        "Content-Type":
        "application/json"
      },

      body:JSON.stringify({

        audio:base64Audio

      })

    }
  );

  const data =
  await response.json();

  return data.text || "";

}