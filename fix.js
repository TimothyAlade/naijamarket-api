export async function handler(event) {

  try {

    const { text, tone } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You rewrite rough messages into polished ${tone} communication. Keep it natural and human.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const fixed =
      data.choices?.[0]?.message?.content ||
      "Could not rewrite message.";

    return {
      statusCode: 200,
      body: JSON.stringify({ result: fixed })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }

}