const mongoose = require("mongoose");

const academicRecordCourseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    creditHours: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    gradePoint: {
      type: Number,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["in-progress", "passed", "failed", "incomplete"],
      default: "in-progress",
    },
  },
  { _id: false },
);

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
      unique: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    courses: {
      type: [academicRecordCourseSchema],
      default: [],
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    GPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

academicRecordSchema.index(
  { student: 1, academicYear: 1, semester: 1 },
  { unique: true },
);
academicRecordSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);
