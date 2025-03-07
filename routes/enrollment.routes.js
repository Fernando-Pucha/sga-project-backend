const express = require('express');
const Enrollment = require('../models/Enrollment.model.js');  // Importamos el modelo de Enrollment
const { isAuth } = require('../middleware/auth.middleware.js'); // Middleware para verificar autenticación

const router = express.Router();

// Ruta para inscribir a un estudiante a un curso
router.post('/enroll', isAuth, (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user._id;  

    Enrollment
        .create({ student: studentId, course: courseId })
        .then((enrollment) => {
            console.log("Student enrolled successfully");
            res.status(201).json(enrollment);
        })
        .catch((error) => {
            console.log("Error enrolling student", error.message);
            res.status(500).json({ error: "Failed to enroll student" });
        });
});

// Ruta para obtener todas las inscripciones de un estudiante
router.get('/enrollments', isAuth, (req, res) => {
    const studentId = req.user._id;

    Enrollment
        .find({ student: studentId })
        .populate('course')
        .then((enrollments) => {
            res.status(200).json(enrollments);
        })
        .catch((error) => {
            console.log("Error fetching enrollments", error.message);
            res.status(500).json({ error: "Failed to retrieve enrollments" });
        });
});

// Ruta para obtener el progreso de un estudiante en un curso
router.get('/enrollments/:courseId', isAuth, (req, res) => {
    const { courseId } = req.params.courseId;
    const studentId = req.user._id;

    Enrollment
        .findOne({ student: studentId, course: courseId })
        .then((enrollment) => {
            if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
            res.status(200).json(enrollment);
        })
        .catch((error) => {
            console.log("Error fetching enrollment", error.message);
            res.status(500).json({ error: "Failed to retrieve enrollment" });
        });
});

// Ruta para actualizar el progreso de un estudiante en un curso
router.put('/enrollments/:courseId', isAuth, (req, res) => {
    const { courseId } = req.params.courseId;
    const studentId = req.user._id;
    const { progress } = req.body;

    Enrollment
        .findOneAndUpdate({ student: studentId, course: courseId }, { progress }, { new: true })
        .then((updatedEnrollment) => {
            if (!updatedEnrollment) return res.status(404).json({ message: "Enrollment not found" });
            res.status(200).json(updatedEnrollment);
        })
        .catch((error) => {
            console.log("Error updating enrollment", error.message);
            res.status(500).json({ error: "Failed to update enrollment" });
        });
});

// Ruta para eliminar una inscripción de un estudiante
router.delete('/enrollments/:courseId', isAuth, (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user._id;

    Enrollment
        .findOneAndDelete({ student: studentId, course: courseId })
        .then((deletedEnrollment) => {
            if (!deletedEnrollment) return res.status(404).json({ message: "Enrollment not found" });
            res.status(200).json({ message: "Enrollment deleted successfully" });
        })
        .catch((error) => {
            console.log("Error deleting enrollment", error.message);
            res.status(500).json({ error: "Failed to delete enrollment" });
        });
});

module.exports = router;
