export async function handler(event){

  try{

    const body =
    JSON.parse(event.body);

    const text =
    body.text;

    const prompt = `

You are VoxFix AI Conversation Analyzer.

Analyze this conversation deeply.

Detect:

1. Emotional tone
2. Interest level
3. Confidence level
4. Social dynamics
5. Business seriousness
6. Manipulation or desperation
7. Best communication strategy

Return JSON ONLY:

{
  "mood":"",
  "situation":"",
  "strategy":"",
  "reply":""
}

Conversation:
${text}

`;

    const response =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {

        method:"POST",

        headers:{

          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`

        },

        body:JSON.stringify({

          model:"gpt-4o-mini",

          messages:[

            {
              role:"system",
              content:prompt
            }

          ],

          temperature:0.7

        })

      }
    );

    const data =
    await response.json();

    const raw =
    data.choices?.[0]?.message?.content ||
    "{}";

    const parsed =
    JSON.parse(raw);

    return{

      statusCode:200,

      body:JSON.stringify(parsed)

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