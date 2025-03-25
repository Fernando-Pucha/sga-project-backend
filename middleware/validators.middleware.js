const { body, validationResult } = require('express-validator');

// Validación para el texto a resumir
const validateSummaryRequest = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('El texto no puede estar vacío')
    .isLength({ min: 10, max: 5000 })
    .withMessage('El texto debe tener entre 10 y 5000 caracteres')
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validación para el tema de contenido corto
const validateShortContentRequest = [
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('El tema no puede estar vacío')
    .isLength({ min: 3, max: 100 })
    .withMessage('El tema debe tener entre 3 y 100 caracteres')
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateChatRequest = [
    body('question')
      .trim()
      .notEmpty()
      .withMessage('La pregunta no puede estar vacía')
      .isLength({ min: 3, max: 500 })
      .withMessage('La pregunta debe tener entre 3 y 500 caracteres')
      .escape(),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

module.exports = {
  validateSummaryRequest,
  validateShortContentRequest,
  validateChatRequest
};