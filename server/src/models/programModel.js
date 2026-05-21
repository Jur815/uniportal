const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Program code is required"],
      trim: true,
      uppercase: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Program must belong to a faculty"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Program must belong to a department"],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

programSchema.index({ name: 1, department: 1 }, { unique: true });
programSchema.index({ code: 1, department: 1 }, { unique: true });
programSchema.index({ faculty: 1, department: 1 });

module.exports = mongoose.model("Program", programSchema);
