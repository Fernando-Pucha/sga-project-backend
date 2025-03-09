const express = require("express");
const { isAuth, isProfessor, isProfessorOrAdmin } = require("../middleware/auth.middleware.js");
const Course = require("../models/Course.model.js");
const User = require("../models/User.model.js");
const Lesson = require("../models/Lesson.model.js");
const mongoose = require('mongoose');

const router = express.Router();

// Ruta para crear un curso (accesible por profesores y administradores)
router.post('/create', isAuth, isProfessorOrAdmin, (req, res) => {
    const { title, description, professorId } = req.body;

    // Verificamos si el usuario es admin y si profesorId está presente
    if (req.user.role === 'admin' && !professorId) {
        return res.status(400).json({ message: "Professor ID is required for admins" });
    }

    // Si el usuario es admin, podemos asignar un profesor diferente
    // Si el usuario es un profesor, asignamos automáticamente su ID
    
    const professor = req.user.role === 'admin' ? professorId : req.user._id;

    // Verificamos si el profesor existe en la base de datos (solo si el usuario es admin)
    if (req.user.role === 'admin' && professorId) {
        User
            .findById(professorId)
            .then(professor => {
                if (!professor) {
                    return res.status(404).json({ message: "Professor not found" });
                }

                // Si el profesor existe, creamos el curso
                Course
                    .create({ title, description, professor })
                    .then((createCourse) => {

                        // Devolver el curso con el ID del profesor
                        Course
                            .findById(createCourse._id)
                            .populate('professor', '_id')
                            .then((courseWithProfessorId) => {
                                console.log("Course created with professor id only");
                                res.status(201).json(courseWithProfessorId);
                            })
                            .catch((error) => {
                                console.log("Error while fetching course with populated professor", error.message);
                                res.status(500).json({ error: "Internal Server Error" });
                            });
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
        Course
            .create({ title, description, professor })
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
router.get('/courses', isAuth, (req, res) => {
    Course
        .find({})
        .populate("professor", "name")
        /* .populate("lessons")  */
        .then((courses) => {
            res.status(200).json(courses);
        })
        .catch((error) => {
            console.log("Error while finding the course", error.message);
            res.status(500).json({ error: "Failed to retrieve courses" });
        });
});

// Ruta para obtener un curso específico por ID
router.get('/:courseId', isAuth, (req, res) => {
    const courseId = req.params.courseId;
    Course
        .findById(courseId)
        .populate("professor", "name")
        /*  .populate("lessons") */
        .then((course) => {
            if (!course) return res.status(404).json({ message: `Course with ID ${courseId} not found` });
            res.status(200).json(course);
        })
        .catch((error) => {
            console.log("Error searching for course by id", error.message);
            res.status(500).json({ message: "Failed to retrieve course id" });
        });
});

// Ruta para obtener todos los cursos de un profesor logueado
router.get('/mycourses', isAuth, isProfessor, (req, res) => {

    const userId = req.user._id;

    Course
        .find({ professor: userId })
        .populate('course')
        .then((courses) => {
            if (!courses || courses.length === 0) {
                return res.status(404).json({ message: "No courses found for this professor" });
            }
            res.status(200).json(courses);
        })
        .catch((error) => {
            console.log("Error while fetching professor's courses", error.message);
            res.status(500).json({ error: "Failed to retrieve courses" });
        });
});




// Ruta para actualizar un curso por ID (profesor puede actualizar título y descripción, admin puede actualizar todo)
router.put('/:courseId', isAuth, isProfessorOrAdmin, (req, res) => {
    const courseId = req.params.courseId;
    const { title, description, professor } = req.body;

    Course
        .findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            if (course.professor.toString() !== req.user._id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "You are not authorized to update this course" });
            }

            if (req.user.role === 'admin' && professor) {
                course.professor = professor;
            }

            course.title = title || course.title;
            course.description = description || course.description;

            course
                .save()
                .then(updatedCourse => {
                    res.status(200).json(updatedCourse);
                })
                .catch(err => {
                    console.error("Error while saving the updated course", err.message);
                    res.status(500).json({ error: "Error while saving the updated course" });
                });
        })
        .catch((err) => {
            console.error("Error finding the course", err.message);
            res.status(500).json({ error: "Error finding the course" });
        });
});

// Ruta para eliminar un curso
router.delete('/:courseId', isAuth, isProfessorOrAdmin, (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    Course
        .findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Verificamos si el usuario es el creador del curso (profesor) o admin
            if (course.professor.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: "You are not authorized to delete this course" });
            }

            // Eliminar todas las lecciones asociadas al curso
            Lesson.deleteMany({ _id: { $in: course.lessons } })
                .then(() => {
                    // Eliminar el curso
                    Course.findByIdAndDelete(courseId)
                        .then(() => {
                            res.status(200).json({ message: "Course and associated lessons deleted successfully" });
                        })
                        .catch((err) => {
                            console.log("Error deleting course", err.message);
                            res.status(500).json({ error: "Error deleting course" });
                        });
                })
                .catch((err) => {
                    console.log("Error deleting lessons", err.message);
                    res.status(500).json({ error: "Error deleting lessons" });
                });
        })
        .catch((error) => {
            console.log("Error finding course", error.message);
            res.status(500).json({ error: "Error finding course" });
        });
});


module.exports = router;
