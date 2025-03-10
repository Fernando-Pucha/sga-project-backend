const express = require('express');
const { isAuth } = require('../middleware/auth.middleware.js');
const Enrollment = require('../models/Enrollment.model.js');
const Course = require("../models/Course.model.js");

const router = express.Router();

// Ruta para inscribir a un estudiante a un curso
router.post('/:courseId/enroll', isAuth, (req, res) => {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Verifica si el curso existe
    Course.findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Verifica si el estudiante ya está inscrito en el curso
            Enrollment.findOne({ student: studentId, course: courseId })
                .then((existingEnrollment) => {
                    if (existingEnrollment) {
                        return res.status(400).json({ message: "Student is already enrolled in this course" });
                    }

                    // Crea inscripción con progreso vacío para cada lección del curso
                    const progress = course.lessons.map(lesson => ({
                        lessonId: lesson,
                        completed: false,
                        completedAt: null
                    }));

                    Enrollment
                        .create({ student: studentId, course: courseId, progress })
                        .then((enrollment) => {
                            console.log("Student enrolled successfully");
                            res.status(201).json(enrollment);  // Devolvemos la inscripción creada
                        })
                        .catch((error) => {
                            console.log("Error enrolling student", error.message);
                            res.status(500).json({ error: "Failed to enroll student" });
                        });
                })
                .catch((error) => {
                    console.log("Error checking enrollment", error.message);
                    res.status(500).json({ error: "Error checking enrollment" });
                });
        })
        .catch((error) => {
            console.log("Error finding course", error.message);
            res.status(500).json({ error: "Error finding course" });
        });
});

// Ruta para eliminar una inscripción de un estudiante
router.delete('/:courseId/disenroll', isAuth, (req, res) => {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Verifica que el estudiante esté inscrito en el curso antes de eliminarlo
    Enrollment
        .findOne({ student: studentId, course: courseId })
        .then((enrollment) => {
            if (!enrollment) {
                return res.status(404).json({ message: "Enrollment not found for this student in the specified course" });
            }

            // Si el estudiante está inscrito, elimino la inscripción
            return Enrollment.findOneAndDelete({ student: studentId, course: courseId });
        })
        .then((deletedEnrollment) => {
            if (!deletedEnrollment) {
                return res.status(404).json({ message: "Enrollment not found" });
            }

            res.status(200).json({ message: "Enrollment deleted successfully" });
        })
        .catch((error) => {
            console.log("Error deleting enrollment", error.message);
            res.status(500).json({ error: "Failed to delete enrollment" });
        });
});


// Ruta para obtener todas las inscripciones de un estudiante
router.get('/', isAuth, (req, res) => {
    const studentId = req.user._id;
    console.log("studentId", req.user);
/*     res.status(200).json({ message: "Enrollments found" }); */

    Enrollment

        .find({ student: studentId})
        .populate('course')
        .then((enrollments) => {
            if (!enrollments || enrollments.length === 0) {
                return res.status(404).json({ message: "No enrollments found for this student" });
            }
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



module.exports = router;
