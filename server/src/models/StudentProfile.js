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
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    level: { type: Number, default: 1, min: 1, max: 6 },
    phone: { type: String, trim: true },
    academicVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentProfileSchema.index({ studentId: 1 });
studentProfileSchema.index({ faculty: 1, department: 1, program: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
