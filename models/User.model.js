const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {type: String,required: [true, "Email is required."],unique: true, lowercase: true,trim: true},
    password: {type: String,required: [true, "Password is required."] },
    name: {type: String,required: [true, "Name is required."]},
    role: { type: String, enum: ["admin", "profesor", "estudiante"], default: "estudiante" },
    /* image:{type: String, default: "https://st4.depositphotos.com/11574170/25191/v/450/depositphotos_251916955-stock-illustration-user-glyph-color-icon.jpg"} */
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = model("User", userSchema);

module.exports = User;
