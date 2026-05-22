const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const programRoutes = require("./routes/programRoutes");
const studentRoutes = require("./routes/studentRoutes");
const academicSessionRoutes = require("./routes/academicSessionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const academicRecordRoutes = require("./routes/academicRecordRoutes");
const errorHandler = require("./middlewares/errorHandler");


const app = express();

app.set("trust proxy", 1);
app.use(helmet());

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const clientOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .join(",")
  .split(",")
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://uniportal-rho.vercel.app",
  ...clientOrigins,
];

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use(
  cors({
    origin: function (origin, callback) {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;

      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "UniPortal API is running",
  });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/student-profile", studentProfileRoutes);
app.use("/api/v1/faculties", facultyRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/academic-sessions", academicSessionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/academic-records", academicRecordRoutes);

app.use(errorHandler);

module.exports = app;
