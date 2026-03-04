const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const MAX_CREDITS = 24;

exports.enroll = async (req, res) => {
  const { academicYear, semester, courses } = req.body;

  if (
    !academicYear ||
    !semester ||
    !Array.isArray(courses) ||
    courses.length === 0
  ) {
    return res.status(400).json({
      status: "fail",
      message: "academicYear, semester, and courses[] are required",
    });
  }

  // validate course ids and compute credits
  const courseDocs = await Course.find({
    _id: { $in: courses.map((id) => new mongoose.Types.ObjectId(id)) },
    isActive: true,
    semester: Number(semester),
  });

  if (courseDocs.length !== courses.length) {
    return res.status(400).json({
      status: "fail",
      message:
        "One or more course IDs are invalid (or inactive / wrong semester).",
    });
  }

  const totalCredits = courseDocs.reduce((sum, c) => sum + c.creditHours, 0);
  if (totalCredits > MAX_CREDITS) {
    return res.status(400).json({
      status: "fail",
      message: `Credit limit exceeded. Max ${MAX_CREDITS}, selected ${totalCredits}.`,
    });
  }

  // Create one enrollment per student per term (unique index enforces this)
  const enrollment = await Enrollment.create({
    student: req.user._id,
    academicYear,
    semester: Number(semester),
    courses,
    totalCredits,
  });

  const populated = await Enrollment.findById(enrollment._id)
    .populate("courses", "title code creditHours semester level")
    .populate("student", "name email");

  res.status(201).json({ status: "success", data: { enrollment: populated } });
};

exports.getMyCourses = async (req, res) => {
  const filter = { student: req.user._id };

  if (req.query.academicYear) filter.academicYear = req.query.academicYear;

  if (req.query.semester !== undefined) {
    const sem = Number(req.query.semester);
    if (![1, 2].includes(sem)) {
      return res.status(400).json({
        status: "fail",
        message: "semester must be 1 or 2",
      });
    }
    filter.semester = sem;
  }

  const enrollments = await Enrollment.find(filter)
    .populate("courses", "title code creditHours semester level")
    .sort({ academicYear: -1, semester: -1, createdAt: -1 });

  const courses = enrollments.flatMap((e) =>
    e.courses.map((c) => ({
      _id: c._id,
      title: c.title,
      code: c.code,
      creditHours: c.creditHours,
      semester: c.semester,
      level: c.level,
      academicYear: e.academicYear,
      enrollmentStatus: e.status,
      enrollmentId: e._id, // helpful for drop/approve later
    })),
  );

  // Stable, UI-friendly ordering
  courses.sort((a, b) => {
    // academicYear like "2025/2026" -> compare start year
    const aStart = Number(String(a.academicYear).slice(0, 4)) || 0;
    const bStart = Number(String(b.academicYear).slice(0, 4)) || 0;

    if (aStart !== bStart) return bStart - aStart; // latest year first
    if (a.semester !== b.semester) return a.semester - b.semester; // sem 1 then 2
    if (a.level !== b.level) return a.level - b.level;
    return String(a.code).localeCompare(String(b.code));
  });

  const summary = courses.reduce(
    (acc, c) => {
      acc.totalCourses += 1;
      acc.totalCredits += Number(c.creditHours) || 0;
      return acc;
    },
    { totalCourses: 0, totalCredits: 0 },
  );

  res.status(200).json({
    status: "success",
    results: courses.length,
    summary,
    data: { courses, enrollments },
  });
};