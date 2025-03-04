const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const enrollmentSchema = new Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    progress: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Course.lessons" }, 
        completed: { type: Boolean, default: false }, 
        completedAt: { type: Date } // Guarda cuándo se completó
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Enrollment = model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
