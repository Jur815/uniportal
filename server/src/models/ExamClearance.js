const mongoose = require("mongoose");

const CLEARANCE_STATUSES = ["eligible", "not_eligible", "pending"];
const FINANCIAL_CLEARANCE_STATUSES = ["cleared", "not_cleared", "pending"];

const examClearanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}\/\d{4}$/, "academicYear must use YYYY/YYYY format"],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
      index: true,
    },
    status: {
      type: String,
      enum: CLEARANCE_STATUSES,
      default: "pending",
      index: true,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    financialClearanceStatus: {
      type: String,
      enum: FINANCIAL_CLEARANCE_STATUSES,
      default: "pending",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  { timestamps: true },
);

examClearanceSchema.index(
  { student: 1, academicYear: 1, semester: 1 },
  { unique: true },
);
examClearanceSchema.index({ academicYear: 1, semester: 1, status: 1 });

module.exports = mongoose.model("ExamClearance", examClearanceSchema);
module.exports.CLEARANCE_STATUSES = CLEARANCE_STATUSES;
module.exports.FINANCIAL_CLEARANCE_STATUSES = FINANCIAL_CLEARANCE_STATUSES;
