const mongoose = require("mongoose");

const gradeBandSchema = new mongoose.Schema(
  {
    minMark: { type: Number, required: true, min: 0, max: 100 },
    maxMark: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true, trim: true, maxlength: 10 },
    gradePoint: { type: Number, required: true, min: 0, max: 5 },
    isPass: { type: Boolean, required: true },
  },
  { _id: false },
);

const gradingPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gradeBands: {
      type: [gradeBandSchema],
      required: true,
      validate: {
        validator: (bands) => Array.isArray(bands) && bands.length > 0,
        message: "At least one grade band is required",
      },
    },
    promotionRules: {
      failedCourseThreshold: { type: Number, default: 1, min: 0 },
      carryOverThreshold: { type: Number, default: 2, min: 0 },
      repeatFailedCourseThreshold: { type: Number, default: 4, min: 1 },
      discontinueFailedCourseThreshold: { type: Number, default: 6, min: 1 },
      minimumGpa: { type: Number, default: 2, min: 0, max: 5 },
      repeatGpaThreshold: { type: Number, default: 1.5, min: 0, max: 5 },
      discontinueGpaThreshold: { type: Number, default: 1, min: 0, max: 5 },
      minimumEarnedCredits: { type: Number, default: 12, min: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

gradingPolicySchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

module.exports = mongoose.model("GradingPolicy", gradingPolicySchema);
