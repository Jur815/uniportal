const Course = require("../models/Course");
const mongoose = require("mongoose");
const Department = require("../models/departmentModel");
const Enrollment = require("../models/Enrollment");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const getIdValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && value._id) return String(value._id);
  return "";
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const populateCourse = (query) =>
  query
    .populate("facultyRef", "name code")
    .populate("departmentRef", "name code")
    .populate("programRef", "name code");

const attachEnrollmentCounts = async (courses) => {
  const ids = courses.map((course) => course._id);

  if (ids.length === 0) return courses;

  const counts = await Enrollment.aggregate([
    { $match: { courses: { $in: ids } } },
    { $unwind: "$courses" },
    { $match: { courses: { $in: ids } } },
    { $group: { _id: "$courses", enrollmentCount: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    counts.map((item) => [String(item._id), item.enrollmentCount]),
  );

  return courses.map((course) => ({
    ...course.toObject(),
    enrollmentCount: countMap.get(String(course._id)) || 0,
  }));
};

const buildCoursePayload = async (body) => {
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
  } = body;

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Course title is required" };
  }

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Course code is required" };
  }

  const parsedCreditHours = Number(creditHours);
  const parsedSemester = Number(semester);
  const parsedLevel = Number(level);

  if (
    !Number.isInteger(parsedCreditHours) ||
    parsedCreditHours < 1 ||
    parsedCreditHours > 10
  ) {
    return { error: "creditHours must be a number between 1 and 10" };
  }

  if (![1, 2].includes(parsedSemester)) {
    return { error: "semester must be 1 or 2" };
  }

  if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
    return { error: "level must be a number between 1 and 6" };
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return { error: "isActive must be a boolean" };
  }

  const facultyId = getIdValue(facultyRef);
  const departmentId = getIdValue(departmentRef);
  const programId = getIdValue(programRef);
  const hasFacultyRef = hasOwn(body, "facultyRef");
  const hasDepartmentRef = hasOwn(body, "departmentRef");
  const hasProgramRef = hasOwn(body, "programRef");

  if (facultyId && !mongoose.Types.ObjectId.isValid(facultyId)) {
    return { error: "A valid faculty ID is required" };
  }

  if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
    return { error: "A valid department ID is required" };
  }

  if (programId && !mongoose.Types.ObjectId.isValid(programId)) {
    return { error: "A valid program ID is required" };
  }

  if (facultyId) {
    const facultyDoc = await Faculty.findById(facultyId);
    if (!facultyDoc) return { error: "Faculty not found" };
  }

  let departmentDoc = null;
  if (departmentId) {
    departmentDoc = await Department.findById(departmentId);
    if (!departmentDoc) return { error: "Department not found" };

    if (facultyId && String(departmentDoc.faculty) !== facultyId) {
      return { error: "Department does not belong to selected faculty" };
    }
  }

  let programDoc = null;
  if (programId) {
    programDoc = await Program.findById(programId);
    if (!programDoc) return { error: "Program not found" };

    if (facultyId && String(programDoc.faculty) !== facultyId) {
      return { error: "Program does not belong to selected faculty" };
    }

    if (departmentId && String(programDoc.department) !== departmentId) {
      return { error: "Program does not belong to selected department" };
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
  else if (hasFacultyRef) payload.facultyRef = null;

  if (departmentDoc) payload.departmentRef = departmentId;
  else if (hasDepartmentRef) payload.departmentRef = null;

  if (programDoc) payload.programRef = programId;
  else if (hasProgramRef) payload.programRef = null;

  if (isActive !== undefined) payload.isActive = isActive;

  return { payload };
};

exports.createCourse = async (req, res) => {
  const { error, payload } = await buildCoursePayload(req.body);

  if (error) {
    return badRequest(res, error);
  }

  const course = await Course.create(payload);
  const populated = await populateCourse(Course.findById(course._id));

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

  const courses = await populateCourse(Course.find(filter)).sort("code");
  res
    .status(200)
    .json({ status: "success", results: courses.length, data: { courses } });
};

exports.getAdminCourses = async (req, res) => {
  const filter = {};

  if (req.query.isActive === "true") filter.isActive = true;
  if (req.query.isActive === "false") filter.isActive = false;
  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.level) filter.level = Number(req.query.level);
  if (req.query.facultyRef) filter.facultyRef = req.query.facultyRef;
  if (req.query.departmentRef) filter.departmentRef = req.query.departmentRef;
  if (req.query.programRef) filter.programRef = req.query.programRef;

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    const search = req.query.search.trim();
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  const courses = await populateCourse(Course.find(filter)).sort({
    isActive: -1,
    code: 1,
  });
  const coursesWithCounts = await attachEnrollmentCounts(courses);

  res.status(200).json({
    status: "success",
    results: coursesWithCounts.length,
    data: { courses: coursesWithCounts },
  });
};

exports.getAdminCourse = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid course ID");
  }

  const course = await populateCourse(Course.findById(req.params.id));

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  const courseId = course._id;
  const statusCounts = await Enrollment.aggregate([
    { $match: { courses: courseId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const enrollmentSummary = statusCounts.reduce(
    (summary, item) => {
      summary.total += item.count;
      summary[item._id] = item.count;
      return summary;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  );

  const recentEnrollments = await Enrollment.find({ courses: courseId })
    .populate("student", "name email")
    .select("student academicYear semester status totalCredits createdAt")
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    status: "success",
    data: {
      course: {
        ...course.toObject(),
        enrollmentCount: enrollmentSummary.total,
        enrollmentSummary,
        recentEnrollments,
      },
    },
  });
};

exports.updateCourse = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid course ID");
  }

  const { error, payload } = await buildCoursePayload(req.body);

  if (error) {
    return badRequest(res, error);
  }

  const course = await populateCourse(
    Course.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: "after",
      runValidators: true,
    }),
  );

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  res.status(200).json({ status: "success", data: { course } });
};

exports.updateCourseStatus = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid course ID");
  }

  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return badRequest(res, "isActive must be a boolean");
  }

  const course = await populateCourse(
    Course.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { returnDocument: "after", runValidators: true },
    ),
  );

  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  res.status(200).json({ status: "success", data: { course } });
};
