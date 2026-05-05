const Course = require("../models/Course");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

exports.createCourse = async (req, res) => {
  const {
    title,
    code,
    creditHours,
    semester,
    level,
    department,
    program,
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

  const payload = {
    title: title.trim(),
    code: code.trim(),
    creditHours: parsedCreditHours,
    semester: parsedSemester,
    level: parsedLevel,
  };

  if (typeof department === "string") payload.department = department.trim();
  if (typeof program === "string") payload.program = program.trim();
  if (isActive !== undefined) payload.isActive = isActive;

  const course = await Course.create(payload);
  res.status(201).json({ status: "success", data: { course } });
};

exports.getCourses = async (req, res) => {
  const filter = { isActive: true };

  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.level) filter.level = Number(req.query.level);
  if (req.query.department) filter.department = req.query.department;
  if (req.query.program) filter.program = req.query.program;

  const courses = await Course.find(filter).sort("code");
  res
    .status(200)
    .json({ status: "success", results: courses.length, data: { courses } });
};
