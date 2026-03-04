const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academicYear: { type: String, required: true }, // "2025/2026"
    semester: { type: Number, required: true, enum: [1, 2] },
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    ],
    totalCredits: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// prevent duplicate enrollment per student per term
enrollmentSchema.index(
  { student: 1, academicYear: 1, semester: 1 },
  { unique: true },
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
