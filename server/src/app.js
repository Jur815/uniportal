const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ✅ PRODUCTION-LEVEL CORS
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

// ✅ Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "UniPortal API is running",
  });
});

// ✅ Root test route (deployment check)
app.get("/", (req, res) => {
  res.send("UniPortal backend live 🚀");
});

// ✅ Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/student-profile", studentProfileRoutes);

// ✅ 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl}`,
  });
});

// ✅ Global error handler (ALWAYS LAST)
app.use(errorHandler);

module.exports = app;
