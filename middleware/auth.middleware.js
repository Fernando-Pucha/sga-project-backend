const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

// Middleware para verificar si el usuario está autenticado
const isAuth = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Obtenemos el token de la cabecera

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        req.user = decoded; // Decodificamos el token y guardamos los datos del usuario en `req.user`
        next();
    });
};

// Middleware para verificar si el usuario es un profesor
const isProfessor = (req, res, next) => {
    const userId = req.user._id;

    User
        .findById(userId)
        .then((user) => {
            if (!user || user.role !== 'profesor') {
                return res.status(403).json({ message: "You are not authorized to perform this action, only professor" });
            }
            next();
        })
        .catch((error) => {
            console.log("Error checking user role", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        });
};

// Middleware para verificar si el usuario es un administrador
const isAdmin = (req, res, next) => {
    const userId = req.user._id;
    User
        .findById(userId)
        .then((user) => {
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: "You are not authorized to perform this action, only admins" });
            }
            next();
        })
        .catch((error) => {
            console.log("Error checking user role", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        });
};

module.exports = { isAuth, isProfessor, isAdmin };
