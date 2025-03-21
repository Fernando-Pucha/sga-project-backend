const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const courseSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required."] },
    description: { type: String, required: [true, "Description is required."] },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: [true, "Professor is required."] },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    price: { type: Number, default: 0},
    duration:{ type: Number, default: 20},
    language:{ type: String, enum: ["English", "French", "German", "Spanish"], default: "Spanish" },    
    category:{ type: String, enum: ["Development", "Programing", "Technology"], default: "Technology" },
    image:{type: String, default: "https://skr.es/wp-content/uploads/2022/05/evaluacion-politicas-publicas-web-scaled.jpg"}
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Course = model("Course", courseSchema);

module.exports = Course;
