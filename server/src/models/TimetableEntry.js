const mongoose = require("mongoose");

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timetableEntrySchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
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
    dayOfWeek: {
      type: String,
      required: true,
      enum: DAYS_OF_WEEK,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "startTime must use HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "endTime must use HH:mm format"],
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    lecturerName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

timetableEntrySchema.index({
  academicYear: 1,
  semester: 1,
  faculty: 1,
  department: 1,
  program: 1,
});

module.exports = mongoose.model("TimetableEntry", timetableEntrySchema);
module.exports.DAYS_OF_WEEK = DAYS_OF_WEEK;
