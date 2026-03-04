const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Routes importing
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// logging (optional) — usually before routes is fine
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => res.send("UniPortal API"));
app.get("/api/v1/health", (req, res) =>
  res.json({ status: "ok", message: "UniPortal API is running" }), 
);

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/profiles", studentProfileRoutes);

// app.use("/api/v1", routes);

// 404 handler
app.all(/.*/, (req, res) => { 
  res
    .status(404)
    .json({ status: "fail", message: `Can't find ${req.originalUrl}` });
});

module.exports = app;

