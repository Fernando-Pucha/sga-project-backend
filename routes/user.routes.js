const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");
const { isAuth, isAdmin, isProfessorOrAdmin } = require("../middleware/auth.middleware.js");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;

// Registro de usuario (signup)
router.post("/signup", (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Provide a valid email address." });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must have at least 6 characters and contain at least one number, one lowercase, and one uppercase letter.",
        });
    }

    // Verificar si el usuario ya existe
    User
        .findOne({ email })
        .then((foundUser) => {
            if (foundUser) {
                return Promise.reject({ status: 400, message: "User already exists." });
            }
            // Encriptar la contraseña
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);
            return hashedPassword;
        })
        .then((hashedPassword) => {
            // Crear el usuario
            return User.create({
                email,
                password: hashedPassword,
                name,
                role: role || "estudiante"
            });
        })
        .then((newUser) => {
            // Enviar respuesta sin la contraseña
            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            });
        })
        .catch((error) => {
            // Manejo de errores con status
            if (error.status) {
                return res.status(error.status).json({ message: error.message });
            }
            // Error inesperado
            console.error("Error creating user:", error.message);
            res.status(500).json({ message: "Error creating user" });
        });
});

// Inicio de sesión (login)
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    User
        .findOne({ email })
        .then((userFound) => {
            if (!userFound) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const passwordCorrect = bcrypt.compareSync(password, userFound.password);

            if (passwordCorrect) {
                const { _id, email, name, role } = userFound;
                const payload = { _id, email, name, role };
                const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
                    algorithm: "HS256",
                    expiresIn: "1d",
                });
                res.status(200).json({ authToken });
            } else {
                res.status(401).json({ message: "Unable to authenticate the user" });
            }
        })
        .catch((error) => {
            console.error("Error logging in:", error.message);
            res.status(500).json({ message: "Error during login" });
        });
});

// Obtener perfil del usuario autenticado
router.get("/profile", isAuth, (req, res) => {
    User
        .findById(req.user._id)
        .select("-password")
        .then((user) => {
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        })
        .catch((error) => {
            console.error("Error retrieving user profile:", error.message);
            res.status(500).json({ message: "Error retrieving profile" });
        });
});

// Actualizar perfil del usuario autenticado
router.put("/profile", isAuth, (req, res) => {
    const { email, name, password } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;

    if (password) {
        // Si se envía una nueva contraseña, se debe encriptar
        bcrypt.hash(password, saltRounds)
            .then((hashedPassword) => {
                updateData.password = hashedPassword;
                return User.findByIdAndUpdate(req.user._id, updateData, { new: true });
            })
            .then((updatedUser) => {
                if (!updatedUser) return res.status(404).json({ message: "User not found" });
                res.status(200).json({ message: "Profile updated", user: updatedUser });
            })
            .catch((error) => {
                console.error("Error updating profile:", error.message);
                res.status(500).json({ message: "Error updating profile" });
            });
    } else {
        User
            .findByIdAndUpdate(req.user._id, updateData, { new: true })
            .then((updatedUser) => {
                if (!updatedUser) return res.status(404).json({ message: "User not found" });
                res.status(200).json({ message: "Profile updated", user: updatedUser });
            })
            .catch((error) => {
                console.error("Error updating profile:", error.message);
                res.status(500).json({ message: "Error updating profile" });
            });
    }
});

// Obtener todos los usuarios
router.get("/users", isAuth, isAdmin, (req, res) => {
    User
        .find()
        .select("-password")
        .then((users) => {
            if (users.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            res.status(200).json(users);
        })
        .catch((error) => {
            console.error("Error retrieving users:", error.message);
            res.status(500).json({ message: "Error retrieving users" });
        });
});

// Ruta para que un admin vea el detalle de un usuario
router.get("/userdetail/:userId", isAuth, isAdmin, (req, res) => {
    const userId = req.params.userId;
    User
        .findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "No users found" });
            }
            res.status(200).json(user);
        })
        .catch(error => {
            console.error("Error searching for user:", error.message);
            res.status(500).json({ message: "Internal error while getting user" });
        });
});

// Eliminar usuario (solo admin)
router.delete("/userdelete/:usersId", isAuth, isAdmin, (req, res) => {
    const usersId = req.params.usersId;
    User
        .findByIdAndDelete(usersId)
        .then((deletedUser) => {
            if (!deletedUser) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ message: "User deleted successfully" });
        })
        .catch((error) => {
            console.error("Error deleting user:", error.message);
            res.status(500).json({ message: "Error deleting user" });
        });
});

// Verificación del usuario autenticado
router.get("/verify", isAuthenticated, (req, res, next) => {
    res.status(200).json(req.payload);
});

module.exports = router;
