const { Schema, model } = require("mongoose");

const lessonSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        videoUrl: { type: String},
        course: { type: Schema.Types.ObjectId, ref: "Course", required: true }, // Referencia al curso
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Lesson = model("Lesson", lessonSchema);

module.exports = Lesson;
