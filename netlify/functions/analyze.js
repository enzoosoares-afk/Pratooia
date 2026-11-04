
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" })
    };
  }

  try {
    const { image } = JSON.parse(event.body || "{}");

    if (!image || !image.startsWith("data:image/")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Envie uma foto válida." })
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-6-astra",
        input: [{
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analise esta foto de comida. Identifique os alimentos, estime as porções e informe calorias, proteínas, carboidratos e gorduras. Responda em português brasileiro, de forma organizada. Deixe claro que são estimativas."
            },
            {
              type: "input_image",
              image_url: image,
              detail: "high"
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Erro na análise."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.output_text })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao analisar a foto." })
    };
  }
};
