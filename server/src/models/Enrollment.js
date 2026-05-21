const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "correction_required"],
      default: "pending",
    },
    decisionReasonType: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    decisionAuditLog: [
      {
        decidedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        decidedAt: {
          type: Date,
          default: Date.now,
        },
        previousStatus: {
          type: String,
          enum: ["pending", "approved", "rejected", "correction_required"],
        },
        newStatus: {
          type: String,
          enum: ["pending", "approved", "rejected", "correction_required"],
          required: true,
        },
        decisionReasonType: {
          type: String,
          trim: true,
          maxlength: 80,
        },
        reason: {
          type: String,
          trim: true,
          maxlength: 300,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index(
  { student: 1, academicYear: 1, semester: 1 },
  { unique: true },
);
enrollmentSchema.index({ courses: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
