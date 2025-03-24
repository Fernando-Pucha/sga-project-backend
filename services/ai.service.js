const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function generateSummary(text) {
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    
    const prompt = `Por favor, genera un resumen conciso del siguiente texto, 
                    destacando los puntos principales y manteniéndolo claro y coherente: 
                    
                    ${text}`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();
  } catch (error) {

    throw new Error("Error al generar el resumen");
  }
}

module.exports = {
  generateSummary
};