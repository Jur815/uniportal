const mongoose = require("mongoose");

const academicSessionSchema = new mongoose.Schema(
  {
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
    },
    registrationOpen: {
      type: Boolean,
      default: false,
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

academicSessionSchema.index(
  { academicYear: 1, semester: 1 },
  { unique: true },
);
academicSessionSchema.index({ isActive: 1, registrationOpen: 1 });

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
