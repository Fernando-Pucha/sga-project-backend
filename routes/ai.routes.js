const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { generateSummary } = require("../services/ai.service");

router.post("/summarize", isAuthenticated, async (req, res, next) => {
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

module.exports = router;