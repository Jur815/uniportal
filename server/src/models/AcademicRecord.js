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
    marks: {
      type: Number,
      min: 0,
      max: 100,
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
    isSupplementary: {
      type: Boolean,
      default: false,
    },
    isCarryOver: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false },
);

const resultAuditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: true },
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
    CGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    earnedCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    failedCourseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    academicStanding: {
      type: String,
      enum: [
        "Pass",
        "Supplementary",
        "Carry Over",
        "Repeat",
        "Discontinued",
        "Suspended",
      ],
      default: "Pass",
    },
    workflowStatus: {
      type: String,
      enum: [
        "draft",
        "lecturer_submitted",
        "dean_hod_reviewed",
        "registrar_finalized",
        "released",
        "returned",
      ],
      default: "draft",
    },
    gradingPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradingPolicy",
    },
    gradingPolicySnapshot: mongoose.Schema.Types.Mixed,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    finalizedAt: Date,
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    releasedAt: Date,
    approvalNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    auditLog: {
      type: [resultAuditSchema],
      default: [],
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
academicRecordSchema.index({ workflowStatus: 1, academicStanding: 1 });
academicRecordSchema.index({ "courses.isSupplementary": 1 });
academicRecordSchema.index({ "courses.isCarryOver": 1 });

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);
