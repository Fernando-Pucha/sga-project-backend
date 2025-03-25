const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { aiLimiter } = require("../middleware/rateLimit.middleware");
const { validateSummaryRequest, validateShortContentRequest, validateChatRequest } = require("../middleware/validators.middleware");
const { generateSummary, generateShortContent,chatbot } = require("../services/ai.service");

// Aplica el limitador a todas las rutas de IA
router.use(aiLimiter);

// Para hacer un resumen
router.post("/summarize", isAuthenticated, validateSummaryRequest, async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Se requiere texto para resumir" });
    }

    const summary = await generateSummary(text);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

//Para generar contenido de un tema
router.post("/short-content", validateShortContentRequest, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Se requiere un tema para generar contenido corto" });
  }

  try {
    const shortContent = await generateShortContent(topic);
    res.json({ shortContent });
  } catch (error) {
    res.status(500).json({ error: "Error al generar el contenido corto" });
  }
});

router.post("/chat", isAuthenticated, validateChatRequest,async (req, res, next) => {
    try {
      const { question } = req.body;
      const userId = req.payload._id; // Obtenemos el ID del usuario del token JWT
      const response = await chatbot(question, userId);
      res.json({ response });
    } catch (error) {
      next(error);
    }
});

module.exports = router;