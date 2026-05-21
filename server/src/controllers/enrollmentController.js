const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const AcademicSession = require("../models/AcademicSession");
const StudentProfile = require("../models/StudentProfile");

const MAX_CREDITS = 24;
const ALLOWED_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "correction_required",
];
const DECISION_REASON_TYPES = [
  "Missing profile information",
  "Wrong semester selection",
  "Exceeded credit load",
  "Academic verification incomplete",
  "Duplicate enrollment",
  "Other",
];
const ACADEMIC_YEAR_PATTERN = /^\d{4}\/\d{4}$/;

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const coursePopulate = {
  path: "courses",
  select:
    "title code creditHours semester level department program facultyRef departmentRef programRef isActive",
  populate: [
    { path: "facultyRef", select: "name code" },
    { path: "departmentRef", select: "name code" },
    { path: "programRef", select: "name code" },
  ],
};

const studentPopulate = {
  path: "student",
  select: "name email role status",
};

const auditPopulate = {
  path: "decisionAuditLog.decidedBy",
  select: "name email role",
};

const getEnrollmentTotalCredits = (enrollment) =>
  Array.isArray(enrollment.courses)
    ? enrollment.courses.reduce(
        (sum, course) => sum + Number(course?.creditHours || 0),
        0,
      )
    : Number(enrollment.totalCredits || 0);

const formatEnrollment = (enrollment, profile) => {
  const plain =
    typeof enrollment.toObject === "function"
      ? enrollment.toObject()
      : enrollment;
  const totalSelectedCredits = getEnrollmentTotalCredits(plain);

  return {
    ...plain,
    studentProfile: profile || null,
    totalSelectedCredits,
    maxCredits: MAX_CREDITS,
    creditWarning: totalSelectedCredits > MAX_CREDITS,
  };
};

const enrichEnrollments = async (enrollments) => {
  const profileUserIds = enrollments
    .map((enrollment) => enrollment.student?._id || enrollment.student)
    .filter(Boolean);
  const profiles = await StudentProfile.find({
    user: { $in: profileUserIds },
  });
  const profileMap = new Map(
    profiles.map((profile) => [String(profile.user), profile.toObject()]),
  );

  return enrollments.map((enrollment) => {
    const studentId = enrollment.student?._id || enrollment.student;
    return formatEnrollment(enrollment, profileMap.get(String(studentId)));
  });
};

exports.enroll = async (req, res) => {
  const { academicYear, semester, courses } = req.body;

  if (
    typeof academicYear !== "string" ||
    semester === undefined ||
    !Array.isArray(courses) ||
    courses.length === 0
  ) {
    return badRequest(res, "academicYear, semester, and courses[] are required");
  }

  const normalizedAcademicYear = academicYear.trim();

  if (!ACADEMIC_YEAR_PATTERN.test(normalizedAcademicYear)) {
    return badRequest(res, "academicYear must use YYYY/YYYY format");
  }

  const sem = Number(semester);

  if (![1, 2].includes(sem)) {
    return badRequest(res, "semester must be 1 or 2");
  }

  const activeSession = await AcademicSession.findOne({
    academicYear: normalizedAcademicYear,
    semester: sem,
    isActive: true,
    registrationOpen: true,
  });

  if (!activeSession) {
    return res.status(400).json({
      status: "fail",
      message:
        "Course registration is not open for this academic year and semester.",
    });
  }

  if (!courses.every((id) => typeof id === "string")) {
    return badRequest(res, "courses[] must contain course IDs");
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
    academicYear: normalizedAcademicYear,
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

    let enrollment;

    try {
      enrollment = await Enrollment.create({
        student: req.user._id,
        academicYear: normalizedAcademicYear,
        semester: sem,
        courses: normalizedCourseIds,
        totalCredits,
        status: "pending",
      });
    } catch (err) {
      if (err.code === 11000) {
        return badRequest(
          res,
          "Enrollment already exists for this academic year and semester.",
        );
      }

      throw err;
    }

    const populated = await Enrollment.findById(enrollment._id)
      .populate(coursePopulate)
      .populate(studentPopulate);

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
  existingEnrollment.rejectionReason = undefined;
  existingEnrollment.decisionReasonType = undefined;

  await existingEnrollment.save();

  const populated = await Enrollment.findById(existingEnrollment._id)
    .populate(coursePopulate)
    .populate(studentPopulate);

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
    .populate(coursePopulate)
    .sort({ academicYear: -1, semester: -1, createdAt: -1 });

  const courses = enrollments.flatMap((e) =>
    e.courses.map((c) => ({
      _id: c._id,
      title: c.title,
      code: c.code,
      creditHours: c.creditHours,
      semester: c.semester,
      level: c.level,
      facultyRef: c.facultyRef,
      departmentRef: c.departmentRef,
      programRef: c.programRef,
      department: c.department,
      program: c.program,
      academicYear: e.academicYear,
      enrollmentStatus: e.status,
      rejectionReason: e.rejectionReason,
      decisionReasonType: e.decisionReasonType,
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
      if (c.enrollmentStatus === "approved") {
        acc.officialCourses += 1;
        acc.officialCredits += Number(c.creditHours) || 0;
      }
      acc.totalCredits += Number(c.creditHours) || 0;
      return acc;
    },
    { totalCourses: 0, totalCredits: 0, officialCourses: 0, officialCredits: 0 },
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
    .populate(studentPopulate)
    .populate(coursePopulate)
    .populate(auditPopulate)
    .sort({ createdAt: -1 });
  const enrichedEnrollments = await enrichEnrollments(enrollments);

  const summary = enrichedEnrollments.reduce(
    (acc, enrollment) => {
      acc.total += 1;
      acc.pending += enrollment.status === "pending" ? 1 : 0;
      acc.approved += enrollment.status === "approved" ? 1 : 0;
      acc.rejected += enrollment.status === "rejected" ? 1 : 0;
      acc.correction_required +=
        enrollment.status === "correction_required" ? 1 : 0;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, correction_required: 0 },
  );

  res.status(200).json({
    status: "success",
    results: enrichedEnrollments.length,
    summary,
    data: { enrollments: enrichedEnrollments },
  });
};

exports.getEnrollment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid enrollment ID",
    });
  }

  const enrollment = await Enrollment.findById(id)
    .populate(studentPopulate)
    .populate(coursePopulate)
    .populate(auditPopulate);

  if (!enrollment) {
    return res.status(404).json({
      status: "fail",
      message: "Enrollment not found",
    });
  }

  const [enrichedEnrollment] = await enrichEnrollments([enrollment]);

  return res.status(200).json({
    status: "success",
    data: { enrollment: enrichedEnrollment },
  });
};

exports.updateEnrollmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, decisionReasonType } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid enrollment ID",
    });
  }

  if (
    typeof status !== "string" ||
    !ALLOWED_STATUSES.includes(status) ||
    status === "pending"
  ) {
    return badRequest(
      res,
      'status must be "approved", "rejected", or "correction_required"',
    );
  }

  if (
    ["rejected", "correction_required"].includes(status) &&
    typeof decisionReasonType === "string" &&
    decisionReasonType.trim() &&
    !DECISION_REASON_TYPES.includes(decisionReasonType.trim())
  ) {
    return badRequest(res, "Invalid decision reason type");
  }

  const enrollment = await Enrollment.findById(id);

  if (!enrollment) {
    return res.status(404).json({
      status: "fail",
      message: "Enrollment not found",
    });
  }

  const previousStatus = enrollment.status;
  const normalizedReasonType =
    ["rejected", "correction_required"].includes(status) &&
    typeof decisionReasonType === "string"
      ? decisionReasonType.trim().slice(0, 80)
      : undefined;
  const normalizedReason =
    ["rejected", "correction_required"].includes(status) &&
    typeof rejectionReason === "string"
      ? rejectionReason.trim().slice(0, 300)
      : undefined;

  enrollment.status = status;
  enrollment.decisionReasonType = normalizedReasonType;
  enrollment.rejectionReason = normalizedReason;
  enrollment.decisionAuditLog.push({
    decidedBy: req.user._id,
    decidedAt: new Date(),
    previousStatus,
    newStatus: status,
    decisionReasonType: normalizedReasonType,
    reason: normalizedReason,
  });
  await enrollment.save();

  const populated = await Enrollment.findById(enrollment._id)
    .populate(studentPopulate)
    .populate(coursePopulate)
    .populate(auditPopulate);
  const [enrichedEnrollment] = await enrichEnrollments([populated]);

  return res.status(200).json({
    status: "success",
    message: `Enrollment ${status} successfully.`,
    data: { enrollment: enrichedEnrollment },
  });
};
