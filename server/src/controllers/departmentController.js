const Department = require("../models/departmentModel");
const Course = require("../models/Course");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");
const mongoose = require("mongoose");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const buildDepartmentPayload = async (body) => {
  const { name, code, faculty, description, isActive } = body;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Department name is required" };
  }

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Department code is required" };
  }

  if (
    typeof faculty !== "string" ||
    !mongoose.Types.ObjectId.isValid(faculty)
  ) {
    return { error: "A valid faculty ID is required" };
  }

  const facultyDoc = await Faculty.findById(faculty);

  if (!facultyDoc) {
    return { error: "Faculty not found" };
  }

  const payload = {
    name: name.trim(),
    code: code.trim(),
    faculty,
  };

  if (typeof description === "string") {
    payload.description = description.trim();
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return { error: "isActive must be a boolean" };
    }
    payload.isActive = isActive;
  }

  return { payload };
};

exports.createDepartment = async (req, res) => {
  try {
    const { error, payload } = await buildDepartmentPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const department = await Department.create(payload);

    res.status(201).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.faculty) {
      filter.faculty = req.query.faculty;
    }

    if (req.query.isActive === "true") filter.isActive = true;
    if (req.query.isActive === "false") filter.isActive = false;

    const departments = await Department.find(filter)
      .populate("faculty", "name code")
      .sort("name");

    res.status(200).json({
      status: "success",
      results: departments.length,
      data: { departments },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "faculty",
      "name code",
    );

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { error, payload } = await buildDepartmentPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("faculty", "name code");

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: "after", runValidators: true },
    ).populate("faculty", "name code");

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
