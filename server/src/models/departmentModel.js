const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      trim: true,
      uppercase: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Department must belong to a faculty"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

departmentSchema.index({ name: 1, faculty: 1 }, { unique: true });
departmentSchema.index({ code: 1, faculty: 1 }, { unique: true });

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
