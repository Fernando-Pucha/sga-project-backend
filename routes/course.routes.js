const express = require("express");
const Course = require("../models/Course.model.js");  // Importamos el modelo de Course
const { isAuth, isProfessor } = require("../middleware/auth.middleware.js");  // Middleware para verificar roles

const router = express.Router();

// Ruta para crear un curso (solo accesible por profesores)
/* router.post('/course', isAuth, isProfessor, (req, res) => {
    const { title, description, lessons } = req.body;
    Course
        .create({ title, description, lessons, professor: req.user._id })
        .then((createCourse) => {
            console.log("Course created");
            res.status(201).json(createCourse);
        })
        .catch((error) => {
            console.log("Error while creating the course", error.message);
            res.status(500).json({ error: "Internal Server Error, not create course" });
        });
});
 */
// Ruta para crear un curso (accesible por profesores y administradores)
router.post('/course', isAuth, isProfessorOrAdmin, (req, res) => {
    const { title, description, lessons, professorId } = req.body;

    // Si el usuario es admin, podemos asignar un profesor diferente
    // Si el usuario es un profesor, asignamos automáticamente su ID
    const professor = req.user.role === 'admin' ? professorId : req.user._id;

    // Verificamos si el profesor existe en la base de datos (solo si el usuario es admin)
    if (req.user.role === 'admin' && professorId) {
        User.findById(professorId)
            .then(professor => {
                if (!professor) {
                    return res.status(404).json({ message: "Professor not found" });
                }

                // Si el profesor existe, creamos el curso
                Course.create({ title, description, lessons, professor })
                    .then((createCourse) => {
                        console.log("Course created");
                        res.status(201).json(createCourse);
                    })
                    .catch((error) => {
                        console.log("Error while creating the course", error.message);
                        res.status(500).json({ error: "Internal Server Error, not create course" });
                    });
            })
            .catch((error) => {
                res.status(500).json({ error: "Error while finding professor" });
            });
    } else {
        // Si el usuario es un profesor, asignamos su propio ID como el profesor
        Course.create({ title, description, lessons, professor })
            .then((createCourse) => {
                console.log("Course created");
                res.status(201).json(createCourse);
            })
            .catch((error) => {
                console.log("Error while creating the course", error.message);
                res.status(500).json({ error: "Internal Server Error, not create course" });
            });
    }
});

// Ruta para obtener todos los cursos
router.get('/course', (req, res) => {
    Course
        .find({})
        .populate("professor", "name")
        .then((courses) => {
            res.status(200).json(courses);
        })
        .catch((error) => {
            console.log("Error while finding the course", error.message);
            res.status(500).json({ error: "Failed to retrieve courses" });
        });
});

// Ruta para obtener un curso específico por ID
router.get('/course/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    Course
        .findById(courseId)
        .populate("professor", "name")
        .then((course) => {
            if (!course) return res.status(404).json({ message: "Course not found" });
            res.status(200).json(course);
        })
        .catch((error) => {
            console.log("Error searching for course by id", error.message);
            res.status(500).json({ message: "Failed to retrieve course id" });
        });
});

// Ruta para actualizar un curso (solo accesible por el profesor que creó el curso)
router.put('/course/:courseId', isAuth, isProfessor, (req, res) => {
    const { title, description, lessons } = req.body;
    const courseId = req.params.courseId;
    Course
        .findByIdAndUpdate(courseId, { title, description, lessons }, { new: true })
        .then((updatedCourse) => {
            if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
            console.log("Course updated");
            res.status(200).json(updatedCourse);
        })
        .catch((error) => {
            console.log("Error while updating the course", error.message);
            res.status(500).json({ message: "Error while updating the course" });
        });
});

// Ruta para eliminar un curso (solo accesible por el profesor que creó el curso)
router.delete('/course/:courseId', isAuth, isProfessor, (req, res) => {
    const courseId = req.params.courseId;
    Course
        .findByIdAndDelete(courseId)
        .then((deletedCourse) => {
            if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
            res.status(200).json({ message: "Course deleted successfully" });
        })
        .catch((error) => {
            console.log("Error deleting course", error.message);
            res.status(500).json({ error: "Failed to delete course" });
        });
});

module.exports = router;
