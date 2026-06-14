const mongoose = require("mongoose");
const AcademicRecord = require("../models/AcademicRecord");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

const COURSE_STATUSES = ["in-progress", "passed", "failed", "incomplete"];

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const studentPopulate = {
  path: "student",
  select: "name email role status",
};

const recordPopulate = [studentPopulate, { path: "enrollment", select: "status" }];

const calculateGpa = (courses) => {
  const gradedCourses = courses.filter(
    (course) => typeof course.gradePoint === "number" && course.gradePoint >= 0,
  );
  const gradedCredits = gradedCourses.reduce(
    (sum, course) => sum + Number(course.creditHours || 0),
    0,
  );

  if (gradedCredits === 0) return 0;

  const weightedPoints = gradedCourses.reduce(
    (sum, course) =>
      sum + Number(course.creditHours || 0) * Number(course.gradePoint || 0),
    0,
  );

  return Math.round((weightedPoints / gradedCredits) * 100) / 100;
};

const getTotalCredits = (courses) =>
  courses.reduce((sum, course) => sum + Number(course.creditHours || 0), 0);

const getProfileMap = async (records) => {
  const studentIds = records.map((record) => record.student?._id || record.student);
  const profiles = await StudentProfile.find({ user: { $in: studentIds } });
  return new Map(
    profiles.map((profile) => [String(profile.user), profile.toObject()]),
  );
};

const formatRecord = (record, profile) => {
  const plain =
    typeof record.toObject === "function" ? record.toObject() : record;
  return {
    ...plain,
    studentProfile: profile || null,
  };
};

const enrichRecords = async (records) => {
  const profileMap = await getProfileMap(records);
  return records.map((record) => {
    const studentId = record.student?._id || record.student;
    return formatRecord(record, profileMap.get(String(studentId)));
  });
};

exports.getRecords = async (req, res) => {
  const filter = {};

  if (req.query.student) {
    if (!mongoose.Types.ObjectId.isValid(req.query.student)) {
      return badRequest(res, "Invalid student ID");
    }
    filter.student = req.query.student;
  }

  const records = await AcademicRecord.find(filter)
    .populate(recordPopulate)
    .sort({ academicYear: -1, semester: -1, createdAt: -1 });
  const enrichedRecords = await enrichRecords(records);

  res.status(200).json({
    status: "success",
    results: enrichedRecords.length,
    data: { records: enrichedRecords },
  });
};

exports.getMyRecords = async (req, res) => {
  const records = await AcademicRecord.find({
    student: req.user._id,
    $or: [
      { workflowStatus: "released" },
      { gradingPolicy: { $exists: false } },
    ],
  })
    .populate(recordPopulate)
    .sort({ academicYear: -1, semester: -1, createdAt: -1 });
  const enrichedRecords = await enrichRecords(records);

  res.status(200).json({
    status: "success",
    results: enrichedRecords.length,
    data: { records: enrichedRecords },
  });
};

exports.generateFromEnrollment = async (req, res) => {
  const { enrollmentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return badRequest(res, "Valid enrollmentId is required");
  }

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate("student", "name email role")
    .populate("courses", "code title creditHours");

  if (!enrollment) {
    return res.status(404).json({
      status: "fail",
      message: "Enrollment not found",
    });
  }

  if (enrollment.status !== "approved") {
    return badRequest(res, "Academic records can only be generated from approved enrollments");
  }

  const student = await User.findOne({
    _id: enrollment.student?._id || enrollment.student,
    role: "student",
  });

  if (!student) {
    return res.status(404).json({
      status: "fail",
      message: "Student not found",
    });
  }

  const enrolledCourses = enrollment.courses.map((course) => ({
    course: course._id,
    code: course.code,
    title: course.title,
    creditHours: Number(course.creditHours || 0),
    status: "in-progress",
  }));
  const previousRecords = await AcademicRecord.find({
    student: student._id,
    "courses.status": "failed",
  }).sort({ academicYear: -1, semester: -1 });
  const enrolledCourseIds = new Set(
    enrolledCourses.map((course) => String(course.course)),
  );
  const carryOverMap = new Map();
  for (const previousRecord of previousRecords) {
    for (const previousCourse of previousRecord.courses) {
      if (
        previousCourse.status === "failed" &&
        !enrolledCourseIds.has(String(previousCourse.course)) &&
        !carryOverMap.has(String(previousCourse.course))
      ) {
        carryOverMap.set(String(previousCourse.course), {
          course: previousCourse.course,
          code: previousCourse.code,
          title: previousCourse.title,
          creditHours: previousCourse.creditHours,
          status: "in-progress",
          isCarryOver: true,
          attemptNumber: Number(previousCourse.attemptNumber || 1) + 1,
        });
      }
    }
  }
  const courses = [...enrolledCourses, ...carryOverMap.values()];

  let record = await AcademicRecord.findOne({ enrollment: enrollment._id });
  let created = false;

  if (!record) {
    try {
      record = await AcademicRecord.create({
        student: student._id,
        enrollment: enrollment._id,
        academicYear: enrollment.academicYear,
        semester: enrollment.semester,
        courses,
        totalCredits: getTotalCredits(courses),
        GPA: 0,
        remarks: "Generated from approved enrollment.",
      });
      created = true;
    } catch (err) {
      if (err.code === 11000) {
        return badRequest(
          res,
          "Academic record already exists for this student, academic year, and semester.",
        );
      }

      throw err;
    }
  }

  const populated = await AcademicRecord.findById(record._id).populate(recordPopulate);
  const [enrichedRecord] = await enrichRecords([populated]);

  res.status(created ? 201 : 200).json({
    status: "success",
    message: "Academic record is ready.",
    data: { record: enrichedRecord },
  });
};

exports.updateRecordGrades = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid academic record ID");
  }

  const record = await AcademicRecord.findById(req.params.id);

  if (!record) {
    return res.status(404).json({
      status: "fail",
      message: "Academic record not found",
    });
  }

  if (!Array.isArray(req.body.courses)) {
    return badRequest(res, "courses[] is required");
  }

  const updates = new Map();

  for (const item of req.body.courses) {
    const courseId = String(item.course || "");

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return badRequest(res, "Each grade update requires a valid course ID");
    }

    if (item.status && !COURSE_STATUSES.includes(item.status)) {
      return badRequest(
        res,
        `course status must be one of: ${COURSE_STATUSES.join(", ")}`,
      );
    }

    if (
      item.gradePoint !== undefined &&
      item.gradePoint !== "" &&
      (Number.isNaN(Number(item.gradePoint)) ||
        Number(item.gradePoint) < 0 ||
        Number(item.gradePoint) > 5)
    ) {
      return badRequest(res, "gradePoint must be between 0 and 5");
    }

    updates.set(courseId, {
      grade:
        typeof item.grade === "string" ? item.grade.trim().slice(0, 10) : "",
      gradePoint:
        item.gradePoint === undefined || item.gradePoint === ""
          ? undefined
          : Number(item.gradePoint),
      status: item.status || "in-progress",
    });
  }

  record.courses = record.courses.map((course) => {
    const update = updates.get(String(course.course));
    if (!update) return course;

    course.grade = update.grade;
    course.gradePoint = update.gradePoint;
    course.status = update.status;
    return course;
  });
  record.totalCredits = getTotalCredits(record.courses);
  record.GPA = calculateGpa(record.courses);
  record.remarks =
    typeof req.body.remarks === "string"
      ? req.body.remarks.trim().slice(0, 500)
      : record.remarks;

  await record.save();

  const populated = await AcademicRecord.findById(record._id).populate(recordPopulate);
  const [enrichedRecord] = await enrichRecords([populated]);

  res.status(200).json({
    status: "success",
    message: "Academic record updated successfully.",
    data: { record: enrichedRecord },
  });
};
