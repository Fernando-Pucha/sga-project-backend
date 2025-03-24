// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db/index");

// Dar acceso a los modelos desde Atlas
require("./models/Course.model");
require("./models/User.model");
require("./models/Enrollment.model");
require("./models/Lesson.model");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

/* const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes); */

const authRoutes = require("./routes/user.routes");
app.use("/api/user", authRoutes);

const courseRoutes = require("./routes/course.routes");
app.use("/api/course", courseRoutes);

const lessonRoutes = require("./routes/lesson.routes");
app.use("/api/lesson", lessonRoutes);

const enrollmentRoutes = require("./routes/enrollment.routes");
app.use("/api/enrollments", enrollmentRoutes);

const aiRoutes = require("./routes/ai.routes");
app.use("/api/ai", aiRoutes);


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
