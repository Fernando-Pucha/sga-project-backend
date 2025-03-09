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

    const newLesson = new Lesson({
        title,
        content,
        videoUrl,
        course: courseId
    });

    newLesson.save()
        .then((createdLesson) => {
            Course
                .findById(courseId)
                .then((course) => {
                    if (!course) {
                        return res.status(404).json({ message: "Course not found" });
                    }

                    if (course.professor.toString() !== userId && req.user.role !== 'admin') {
                        return res.status(403).json({ message: "You are not authorized to add lessons to this course" });
                    }

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
                    console.error("Error finding course", err.message);
                    res.status(500).json({ error: "Error finding course" });
                });
        })
        .catch(err => {
            console.error("Error saving lesson", err.message);
            res.status(500).json({ error: "Error creating lesson" });
        });
});

module.exports = router;
