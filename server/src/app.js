const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express(); 

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
   
app.use(express.json());

// Health check (Day 9 requirement)
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    message: "UniPortal API is running",
  });
});

// test
app.get("/", (req, res) => {
  res.send("UniPortal backend live");
});
 
// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes); 
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/profiles", studentProfileRoutes);

// 404 handler (Express 5 safe)
app.all(/.*/, (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl}`,
  });
});

// Global error handler (ALWAYS LAST)
app.use(errorHandler);

module.exports = app;
