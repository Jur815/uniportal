const mongoose = require("mongoose");

const COMPLAINT_TYPES = [
  "registration_issue",
  "course_issue",
  "academic_record_issue",
  "profile_issue",
  "technical_issue",
  "general_inquiry",
];

const COMPLAINT_STATUSES = ["open", "in_review", "resolved", "closed"];

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    complaintType: {
      type: String,
      enum: COMPLAINT_TYPES,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "open",
      index: true,
    },
    response: {
      type: String,
      trim: true,
      maxlength: 1200,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
module.exports.COMPLAINT_TYPES = COMPLAINT_TYPES;
module.exports.COMPLAINT_STATUSES = COMPLAINT_STATUSES;
