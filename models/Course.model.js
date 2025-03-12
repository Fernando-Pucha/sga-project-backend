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
    image:{type: String, default: "https://i.blogs.es/8ba74b/man-2562325_1920/1200_800.webp"}
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Course = model("Course", courseSchema);

module.exports = Course;
