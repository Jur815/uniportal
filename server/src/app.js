const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRoutes);

// logging (optional) — usually before routes is fine
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => res.send("UniPortal API"));

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// app.use("/api/v1", routes);

app.all(/.*/, (req, res) => { 
  res
    .status(404)
    .json({ status: "fail", message: `Can't find ${req.originalUrl}` });
});

module.exports = app;

