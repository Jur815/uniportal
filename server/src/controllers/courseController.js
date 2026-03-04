const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  const course = await Course.create(req.body);
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
