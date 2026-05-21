const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    creditHours: { type: Number, required: true, min: 1, max: 10 },
    semester: { type: Number, required: true, enum: [1, 2] },
    level: { type: Number, required: true, min: 1, max: 6 },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    facultyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    departmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    programRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

courseSchema.index({ semester: 1, level: 1 });
courseSchema.index({ facultyRef: 1, departmentRef: 1, programRef: 1 });

module.exports = mongoose.model("Course", courseSchema);
