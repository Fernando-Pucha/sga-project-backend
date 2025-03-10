const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const courseSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required."] },
    description: { type: String, required: [true, "Description is required."] },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: [true, "Professor is required."] },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Course = model("Course", courseSchema);

module.exports = Course;
