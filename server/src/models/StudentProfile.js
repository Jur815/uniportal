const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentId: { type: String, unique: true, sparse: true, trim: true },
    registrationNumber: { type: String, unique: true, sparse: true, trim: true },
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    level: { type: Number, default: 1, min: 1, max: 6 },
    yearOfStudy: { type: Number, min: 1, max: 6 },
    intakeYear: { type: Number, min: 1900, max: 3000 },
    phone: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    academicVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentProfileSchema.index({ studentId: 1 });
studentProfileSchema.index({ registrationNumber: 1 });
studentProfileSchema.index({ faculty: 1, department: 1, program: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
