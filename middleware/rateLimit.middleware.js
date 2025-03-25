const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Límite de 50 peticiones por ventana por IP
    message: {
        message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos"
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    aiLimiter
};