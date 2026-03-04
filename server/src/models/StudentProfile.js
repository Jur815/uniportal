const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentId: { type: String, required: true, unique: true, trim: true },
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    level: { type: Number, default: 1, min: 1, max: 6 },
    phone: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
