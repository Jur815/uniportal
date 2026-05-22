const Faculty = require("../models/facultyModel");
const Course = require("../models/Course");
const Department = require("../models/departmentModel");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const buildFacultyPayload = (body) => {
  const { name, code, description, isActive } = body;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Faculty name is required" };
  }

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Faculty code is required" };
  }

  const payload = {
    name: name.trim(),
    code: code.trim(),
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

exports.createFaculty = async (req, res) => {
  try {
    const { error, payload } = buildFacultyPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const faculty = await Faculty.create(payload);

    res.status(201).json({
      status: "success",
      data: { faculty },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getAllFaculties = async (req, res) => {
  try {
    const filter = {};

    if (req.query.isActive === "true") filter.isActive = true;
    if (req.query.isActive === "false") filter.isActive = false;

    const faculties = await Faculty.find(filter).sort("name");

    res.status(200).json({
      status: "success",
      results: faculties.length,
      data: { faculties },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        status: "fail",
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { faculty },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { error, payload } = buildFacultyPayload(req.body);

    if (error) {
      return badRequest(res, error);
    }

    const faculty = await Faculty.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!faculty) {
      return res.status(404).json({
        status: "fail",
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { faculty },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true },
    );

    if (!faculty) {
      return res.status(404).json({
        status: "fail",
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { faculty },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
