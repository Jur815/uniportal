const Course = require("../models/Course");
const mongoose = require("mongoose");
const Department = require("../models/departmentModel");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const getIdValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && value._id) return String(value._id);
  return "";
};

exports.createCourse = async (req, res) => {
  const {
    title,
    code,
    creditHours,
    semester,
    level,
    department,
    program,
    facultyRef,
    departmentRef,
    programRef,
    isActive,
  } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return badRequest(res, "Course title is required");
  }

  if (typeof code !== "string" || !code.trim()) {
    return badRequest(res, "Course code is required");
  }

  const parsedCreditHours = Number(creditHours);
  const parsedSemester = Number(semester);
  const parsedLevel = Number(level);

  if (
    !Number.isInteger(parsedCreditHours) ||
    parsedCreditHours < 1 ||
    parsedCreditHours > 10
  ) {
    return badRequest(res, "creditHours must be a number between 1 and 10");
  }

  if (![1, 2].includes(parsedSemester)) {
    return badRequest(res, "semester must be 1 or 2");
  }

  if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
    return badRequest(res, "level must be a number between 1 and 6");
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return badRequest(res, "isActive must be a boolean");
  }

  const facultyId = getIdValue(facultyRef);
  const departmentId = getIdValue(departmentRef);
  const programId = getIdValue(programRef);

  if (facultyId && !mongoose.Types.ObjectId.isValid(facultyId)) {
    return badRequest(res, "A valid faculty ID is required");
  }

  if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
    return badRequest(res, "A valid department ID is required");
  }

  if (programId && !mongoose.Types.ObjectId.isValid(programId)) {
    return badRequest(res, "A valid program ID is required");
  }

  if (facultyId) {
    const facultyDoc = await Faculty.findById(facultyId);
    if (!facultyDoc) return badRequest(res, "Faculty not found");
  }

  let departmentDoc = null;
  if (departmentId) {
    departmentDoc = await Department.findById(departmentId);
    if (!departmentDoc) return badRequest(res, "Department not found");

    if (facultyId && String(departmentDoc.faculty) !== facultyId) {
      return badRequest(res, "Department does not belong to selected faculty");
    }
  }

  let programDoc = null;
  if (programId) {
    programDoc = await Program.findById(programId);
    if (!programDoc) return badRequest(res, "Program not found");

    if (facultyId && String(programDoc.faculty) !== facultyId) {
      return badRequest(res, "Program does not belong to selected faculty");
    }

    if (departmentId && String(programDoc.department) !== departmentId) {
      return badRequest(res, "Program does not belong to selected department");
    }
  }

  const payload = {
    title: title.trim(),
    code: code.trim(),
    creditHours: parsedCreditHours,
    semester: parsedSemester,
    level: parsedLevel,
  };

  if (typeof department === "string") payload.department = department.trim();
  if (typeof program === "string") payload.program = program.trim();
  if (facultyId) payload.facultyRef = facultyId;
  if (departmentDoc) payload.departmentRef = departmentId;
  if (programDoc) payload.programRef = programId;
  if (isActive !== undefined) payload.isActive = isActive;

  const course = await Course.create(payload);
  const populated = await Course.findById(course._id)
    .populate("facultyRef", "name code")
    .populate("departmentRef", "name code")
    .populate("programRef", "name code");

  res.status(201).json({ status: "success", data: { course: populated } });
};

exports.getCourses = async (req, res) => {
  const filter = { isActive: true };

  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.level) filter.level = Number(req.query.level);
  if (req.query.department) filter.department = req.query.department;
  if (req.query.program) filter.program = req.query.program;
  if (req.query.facultyRef) filter.facultyRef = req.query.facultyRef;
  if (req.query.departmentRef) filter.departmentRef = req.query.departmentRef;
  if (req.query.programRef) filter.programRef = req.query.programRef;

  const courses = await Course.find(filter)
    .populate("facultyRef", "name code")
    .populate("departmentRef", "name code")
    .populate("programRef", "name code")
    .sort("code");
  res
    .status(200)
    .json({ status: "success", results: courses.length, data: { courses } });
};
