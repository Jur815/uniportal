const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const MAX_CREDITS = 24;
const ALLOWED_STATUSES = ["pending", "approved", "rejected"];

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

  const sem = Number(semester);

  if (![1, 2].includes(sem)) {
    return res.status(400).json({
      status: "fail",
      message: "semester must be 1 or 2",
    });
  }

  const invalidIds = courses.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id),
  );

  if (invalidIds.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "One or more course IDs are invalid.",
      invalidIds,
    });
  }

  const normalizedCourseIds = [...new Set(courses.map(String))];

  const courseDocs = await Course.find({
    _id: { $in: normalizedCourseIds },
    isActive: true,
    semester: sem,
  });

  if (courseDocs.length !== normalizedCourseIds.length) {
    return res.status(400).json({
      status: "fail",
      message:
        "One or more course IDs are invalid, inactive, or belong to the wrong semester.",
    });
  }

  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    academicYear,
    semester: sem,
  });

  if (!existingEnrollment) {
    const totalCredits = courseDocs.reduce(
      (sum, c) => sum + Number(c.creditHours || 0),
      0,
    );

    if (totalCredits > MAX_CREDITS) {
      return res.status(400).json({
        status: "fail",
        message: `Credit limit exceeded. Max ${MAX_CREDITS}, selected ${totalCredits}.`,
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      academicYear,
      semester: sem,
      courses: normalizedCourseIds,
      totalCredits,
      status: "pending",
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate("courses", "title code creditHours semester level")
      .populate("student", "name email");

    return res.status(201).json({
      status: "success",
      message: "Enrollment created successfully.",
      data: { enrollment: populated },
    });
  }

  if (existingEnrollment.status === "approved") {
    return res.status(400).json({
      status: "fail",
      message:
        "This enrollment has already been approved and cannot be modified.",
    });
  }

  const existingCourseIds = existingEnrollment.courses.map((id) => String(id));

  const newCourseIds = normalizedCourseIds.filter(
    (id) => !existingCourseIds.includes(id),
  );

  if (newCourseIds.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "You are already enrolled in this course.",
    });
  }

  const newCourseDocs = courseDocs.filter((course) =>
    newCourseIds.includes(String(course._id)),
  );

  const addedCredits = newCourseDocs.reduce(
    (sum, c) => sum + Number(c.creditHours || 0),
    0,
  );

  const currentCredits = Number(existingEnrollment.totalCredits || 0);
  const updatedCredits = currentCredits + addedCredits;

  if (updatedCredits > MAX_CREDITS) {
    return res.status(400).json({
      status: "fail",
      message: `Credit limit exceeded. Max ${MAX_CREDITS}, attempted total ${updatedCredits}.`,
    });
  }

  existingEnrollment.courses.push(...newCourseIds);
  existingEnrollment.totalCredits = updatedCredits;
  existingEnrollment.status = "pending";

  await existingEnrollment.save();

  const populated = await Enrollment.findById(existingEnrollment._id)
    .populate("courses", "title code creditHours semester level")
    .populate("student", "name email");

  return res.status(200).json({
    status: "success",
    message: "Enrollment updated successfully.",
    data: { enrollment: populated },
  });
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
      enrollmentId: e._id,
    })),
  );

  courses.sort((a, b) => {
    const aStart = Number(String(a.academicYear).slice(0, 4)) || 0;
    const bStart = Number(String(b.academicYear).slice(0, 4)) || 0;

    if (aStart !== bStart) return bStart - aStart;
    if (a.semester !== b.semester) return a.semester - b.semester;
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

exports.getAllEnrollments = async (req, res) => {
  const filter = {};

  if (req.query.academicYear) {
    filter.academicYear = req.query.academicYear;
  }

  if (req.query.semester !== undefined && req.query.semester !== "") {
    const sem = Number(req.query.semester);
    if (![1, 2].includes(sem)) {
      return res.status(400).json({
        status: "fail",
        message: "semester must be 1 or 2",
      });
    }
    filter.semester = sem;
  }

  if (req.query.status) {
    if (!ALLOWED_STATUSES.includes(req.query.status)) {
      return res.status(400).json({
        status: "fail",
        message: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }
    filter.status = req.query.status;
  }

  const enrollments = await Enrollment.find(filter)
    .populate("student", "name email role")
    .populate("courses", "title code creditHours semester level")
    .sort({ createdAt: -1 });

  const summary = enrollments.reduce(
    (acc, enrollment) => {
      acc.total += 1;
      acc.pending += enrollment.status === "pending" ? 1 : 0;
      acc.approved += enrollment.status === "approved" ? 1 : 0;
      acc.rejected += enrollment.status === "rejected" ? 1 : 0;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  );

  res.status(200).json({
    status: "success",
    results: enrollments.length,
    summary,
    data: { enrollments },
  });
};

exports.updateEnrollmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid enrollment ID",
    });
  }

  if (!ALLOWED_STATUSES.includes(status) || status === "pending") {
    return res.status(400).json({
      status: "fail",
      message: 'status must be either "approved" or "rejected"',
    });
  }

  const enrollment = await Enrollment.findById(id);

  if (!enrollment) {
    return res.status(404).json({
      status: "fail",
      message: "Enrollment not found",
    });
  }

  enrollment.status = status;
  await enrollment.save();

  const populated = await Enrollment.findById(enrollment._id)
    .populate("student", "name email role")
    .populate("courses", "title code creditHours semester level");

  return res.status(200).json({
    status: "success",
    message: `Enrollment ${status} successfully.`,
    data: { enrollment: populated },
  });
};
