const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Faculty code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
