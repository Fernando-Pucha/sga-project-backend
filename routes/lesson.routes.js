const express = require("express");
const { isAuth, isProfessorOrAdmin } = require("../middleware/auth.middleware.js");
const router = express.Router();
const Lesson = require("../models/Lesson.model.js");
const Course = require("../models/Course.model.js");

// Ruta para crear una lección como profesor del curso o admin
router.post('/:courseId/lessons', isAuth, isProfessorOrAdmin, (req, res) => {
    const courseId = req.params.courseId;
    const { title, content, videoUrl } = req.body;
    const userId = req.user._id;

    Course
        .findById(courseId)
        .then(course => {
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Verifica si el usuario es el profesor o un administrador
            if (course.professor.toString() !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: "You are not authorized to add lessons to this course" });
            }

            const newLesson = new Lesson({
                title,
                content,
                videoUrl,
                course: courseId
            });

            newLesson
                .save()
                .then(createdLesson => {

                    course.lessons.push(createdLesson._id);

                    course
                        .save()
                        .then(updatedCourse => {
                            res.status(201).json({ createdLesson });
                        })
                        .catch(err => {
                            console.error("Error while saving course", err.message);
                            res.status(500).json({ error: "Error while updating course" });
                        });
                })
                .catch(err => {
                    console.error("Error saving lesson", err.message);
                    res.status(500).json({ error: "Error creating lesson" });
                });
        }).catch(err => {
            console.error("Error finding course", err.message);
            res.status(500).json({ error: "Error finding course" });
        });
});

// Ruta para obtener todas las lecciones de un curso
router.get('/:courseId/lessons', isAuth, (req, res) => {
    const courseId = req.params.courseId;

    Course
        .findById(courseId)
        .populate('lessons')
        .then(course => {
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            res.status(200).json(course.lessons); // Devuelve todas las lecciones encontradas
        })
        .catch(error => {
            console.log("Error fetching lessons", error.message);
            res.status(500).json({ error: "Failed to retrieve lessons" });
        });
});

// Ruta para obtener una lección específica por ID
router.get('/:courseId/lessons/:lessonId', isAuth, (req, res) => {
    const lessonId = req.params.lessonId;

    Lesson.findById(lessonId)
        .then(lesson => {
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }
            res.status(200).json(lesson); // Devuelve la lección encontrada
        })
        .catch(error => {
            console.log("Error fetching lesson", error.message);
            res.status(500).json({ error: "Failed to retrieve lesson" });
        });
});

// Ruta para actualizar una lección
router.put('/:courseId/lessons/:lessonId', isAuth, isProfessorOrAdmin, (req, res) => {
    const courseId = req.params.courseId;
    const lessonId = req.params.lessonId;
    const userId = req.user._id;
    const { title, content, videoUrl } = req.body;

    Lesson
        .findById(lessonId)
        .then(lesson => {
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }

            // Verificar si el curso corresponde al usuario
            if (lesson.course.toString() !== courseId) {
                return res.status(400).json({ message: "Lesson does not belong to this course" });
            }

            // Verificar que el usuario sea el profesor del curso o admin
            Course
                .findById(courseId)
                .then(course => {
                    if (!course) {
                        return res.status(404).json({ message: "Course not found" });
                    }

                    if (course.professor.toString() !== userId && req.user.role !== 'admin') {
                        return res.status(403).json({ message: "You are not authorized to update this lesson" });
                    }

                    lesson.title = title;
                    lesson.content = content;
                    lesson.videoUrl = videoUrl;

                    lesson
                        .save()
                        .then(updatedLesson => {
                            res.status(200).json(updatedLesson); // Devuelve la lección actualizada
                        })
                        .catch(error => {
                            console.log("Error updating lesson", error.message);
                            res.status(500).json({ error: "Failed to update lesson" });
                        });
                }).catch(err => {
                    console.log("Error finding course", err.message);
                    res.status(500).json({ error: "Error finding course" });
                });
        }).catch(err => {
            console.log("Error finding lesson", err.message);
            res.status(500).json({ error: "Error finding lesson" });
        });
});

// Ruta para eliminar una lección solo si eres el profesor del curso o admin
router.delete('/:courseId/lessons/:lessonId', isAuth, isProfessorOrAdmin, (req, res) => {
    const courseId = req.params.courseId;
    const lessonId = req.params.lessonId;
    const userId = req.user._id;

    Lesson
        .findById(lessonId)
        .then(deletedLesson => {
            if (!deletedLesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }

            if (deletedLesson.course.toString() !== courseId) {
                return res.status(400).json({ message: "Lesson does not belong to this course" });
            }

            Course
                .findById(courseId)
                .then(course => {
                    if (!course) {
                        return res.status(404).json({ message: "Course not found" });
                    }

                    if (course.professor.toString() !== userId && req.user.role !== 'admin') {
                        return res.status(403).json({ message: "You are not authorized to delete this lesson" });
                    }

                    Lesson
                        .findByIdAndDelete(lessonId)
                        .then(() => {

                            Course
                                .updateMany(
                                    { lessons: lessonId },
                                    { $pull: { lessons: lessonId } }
                                )
                                .then(() => {
                                    res.status(200).json({ message: "Lesson deleted successfully" });
                                })
                                .catch(error => {
                                    console.log("Error removing lesson from course", error.message);
                                    res.status(500).json({ error: "Failed to remove lesson from course" });
                                });
                        })
                        .catch(error => {
                            console.log("Error deleting lesson", error.message);
                            res.status(500).json({ error: "Failed to delete lesson" });
                        });
                })
                .catch(error => {
                    console.log("Error finding course", error.message);
                    res.status(500).json({ error: "Error finding course" });
                });
        })
        .catch(error => {
            console.log("Error finding lesson", error.message);
            res.status(500).json({ error: "Error finding lesson" });
        });
});

module.exports = router;
