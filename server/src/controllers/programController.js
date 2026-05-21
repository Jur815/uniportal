const mongoose = require("mongoose");
const Course = require("../models/Course");
const Department = require("../models/departmentModel");
const Program = require("../models/programModel");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const buildProgramPayload = async (body) => {
  const { name, code, faculty, department, description, isActive } = body;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Program name is required" };
  }

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Program code is required" };
  }

  if (typeof faculty !== "string" || !mongoose.Types.ObjectId.isValid(faculty)) {
    return { error: "A valid faculty ID is required" };
  }

  if (
    typeof department !== "string" ||
    !mongoose.Types.ObjectId.isValid(department)
  ) {
    return { error: "A valid department ID is required" };
  }

  const departmentDoc = await Department.findById(department);

  if (!departmentDoc) {
    return { error: "Department not found" };
  }

  if (String(departmentDoc.faculty) !== faculty) {
    return { error: "Department does not belong to the selected faculty" };
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return { error: "isActive must be a boolean" };
  }

  const payload = {
    name: name.trim(),
    code: code.trim(),
    faculty,
    department,
  };

  if (typeof description === "string") {
    payload.description = description.trim();
  }

  if (isActive !== undefined) {
    payload.isActive = isActive;
  }

  return { payload };
};

exports.createProgram = async (req, res) => {
  try {
    const { error, payload } = await buildProgramPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const program = await Program.create(payload);
    const populated = await Program.findById(program._id)
      .populate("faculty", "name code")
      .populate("department", "name code");

    res.status(201).json({
      status: "success",
      data: { program: populated },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.code === 11000 ? "Program already exists" : error.message,
    });
  }
};

exports.getAllPrograms = async (req, res) => {
  try {
    const filter = {};

    if (req.query.faculty) filter.faculty = req.query.faculty;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const programs = await Program.find(filter)
      .populate("faculty", "name code")
      .populate("department", "name code")
      .sort("name");

    res.status(200).json({
      status: "success",
      results: programs.length,
      data: { programs },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate("faculty", "name code")
      .populate("department", "name code");

    if (!program) {
      return res.status(404).json({
        status: "fail",
        message: "Program not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { program },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { error, payload } = await buildProgramPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const program = await Program.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("faculty", "name code")
      .populate("department", "name code");

    if (!program) {
      return res.status(404).json({
        status: "fail",
        message: "Program not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { program },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.code === 11000 ? "Program already exists" : error.message,
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const courseCount = await Course.countDocuments({
      programRef: req.params.id,
    });

    if (courseCount > 0) {
      return badRequest(
        res,
        "Program cannot be deleted while courses use it",
      );
    }

    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        status: "fail",
        message: "Program not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
