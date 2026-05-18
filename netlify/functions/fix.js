export async function handler(event){

  try{

    const body =
    JSON.parse(event.body);

    let finalText =
    body.text || "";

    let detectedLanguage =
    "Unknown";

    if(body.audio){

      const transcription =
      await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method:"POST",

          headers:{
            "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
          },

          body:createFormData(
            body.audio
          )

        }
      );

      const transcriptionData =
      await transcription.json();

      finalText =
      transcriptionData.text;

    }

    const languageResponse =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method:"POST",

        headers:{

          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${process.env.OPENAI_API_KEY}`

        },

        body:JSON.stringify({

          model:"gpt-4.1-mini",

          messages:[

            {
              role:"system",

              content:`
              Detect the language of this text.
              Reply ONLY with the language name.
              `
            },

            {
              role:"user",

              content:finalText
            }

          ]

        })

      }
    );

    const languageData =
    await languageResponse.json();

    detectedLanguage =
    languageData.choices?.[0]
    ?.message?.content ||
    "Unknown";

    const premiumTones = [

      "CEO Style",

      "Luxury English",

      "Elite Business",

      "High Value Texting",

      "Premium Client Pitch"

    ];

    const isPremiumTone =
    premiumTones.includes(
      body.tone
    );

    const model =
    isPremiumTone
    ?
    "gpt-4.1"
    :
    "gpt-4.1-mini";

    const response =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method:"POST",

        headers:{

          "Content-Type":
          "application/json",

          "Authorization":
          `Bearer ${process.env.OPENAI_API_KEY}`

        },

        body:JSON.stringify({

          model,

          messages:[

            {

              role:"system",

              content:`

You are VoxFix AI.

You rewrite messages into polished,
natural, intelligent communication.

Detected Language:
${detectedLanguage}

RULES:
- preserve meaning
- sound human
- improve confidence
- improve emotional intelligence
- remove awkwardness
- never sound robotic

SPECIAL MODE:
${body.instruction}

              `

            },

            {

              role:"user",

              content:finalText

            }

          ],

          temperature:0.9,

          max_tokens:500

        })

      }
    );

    const data =
    await response.json();

    return{

      statusCode:200,

      body:JSON.stringify({

        result:
        data.choices?.[0]
        ?.message?.content ||

        "Could not rewrite.",

        detectedLanguage

      })

    };

  }catch(error){

    return{

      statusCode:500,

      body:JSON.stringify({

        error:error.message

      })

    };

  }

}

function createFormData(base64Audio){

  const formData =
  new FormData();

  const buffer =
  Buffer.from(
    base64Audio,
    "base64"
  );

  const blob =
  new Blob([buffer]);

  formData.append(
    "file",
    blob,
    "voice.mp3"
  );

  formData.append(
    "model",
    "whisper-1"
  );

  return formData;

}