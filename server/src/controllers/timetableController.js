const mongoose = require("mongoose");
const AcademicSession = require("../models/AcademicSession");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Faculty = require("../models/facultyModel");
const Department = require("../models/departmentModel");
const Program = require("../models/programModel");
const StudentProfile = require("../models/StudentProfile");
const TimetableEntry = require("../models/TimetableEntry");
const { DAYS_OF_WEEK } = require("../models/TimetableEntry");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const populateEntry = (query) =>
  query
    .populate("course", "code title creditHours semester level")
    .populate("faculty", "name code")
    .populate("department", "name code")
    .populate("program", "name code");

const getIdValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && value._id) return String(value._id);
  return "";
};

const validateOptionalRef = async (Model, value, label) => {
  const id = getIdValue(value);
  if (!id) return { id: null };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: `A valid ${label} ID is required` };
  }

  const doc = await Model.findById(id);
  if (!doc) return { error: `${label} not found` };

  return { id, doc };
};

const buildEntryPayload = async (body) => {
  const {
    course,
    faculty,
    department,
    program,
    academicYear,
    semester,
    dayOfWeek,
    startTime,
    endTime,
    venue,
    lecturerName,
    isActive,
  } = body;

  const courseId = getIdValue(course);
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return { error: "A valid course ID is required" };
  }

  const courseDoc = await Course.findById(courseId);
  if (!courseDoc) return { error: "Course not found" };

  if (typeof academicYear !== "string" || !/^\d{4}\/\d{4}$/.test(academicYear)) {
    return { error: "academicYear must use YYYY/YYYY format" };
  }

  const parsedSemester = Number(semester);
  if (![1, 2].includes(parsedSemester)) {
    return { error: "semester must be 1 or 2" };
  }

  if (!DAYS_OF_WEEK.includes(dayOfWeek)) {
    return { error: "Valid dayOfWeek is required" };
  }

  if (!TIME_PATTERN.test(String(startTime || ""))) {
    return { error: "startTime must use HH:mm format" };
  }

  if (!TIME_PATTERN.test(String(endTime || ""))) {
    return { error: "endTime must use HH:mm format" };
  }

  if (String(startTime) >= String(endTime)) {
    return { error: "endTime must be after startTime" };
  }

  if (typeof venue !== "string" || !venue.trim()) {
    return { error: "Venue is required" };
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return { error: "isActive must be a boolean" };
  }

  const facultyCheck = await validateOptionalRef(Faculty, faculty, "Faculty");
  if (facultyCheck.error) return { error: facultyCheck.error };

  const departmentCheck = await validateOptionalRef(
    Department,
    department,
    "Department",
  );
  if (departmentCheck.error) return { error: departmentCheck.error };

  const programCheck = await validateOptionalRef(Program, program, "Program");
  if (programCheck.error) return { error: programCheck.error };

  if (
    facultyCheck.id &&
    departmentCheck.doc &&
    String(departmentCheck.doc.faculty) !== facultyCheck.id
  ) {
    return { error: "Department does not belong to selected faculty" };
  }

  if (
    facultyCheck.id &&
    programCheck.doc &&
    String(programCheck.doc.faculty) !== facultyCheck.id
  ) {
    return { error: "Program does not belong to selected faculty" };
  }

  if (
    departmentCheck.id &&
    programCheck.doc &&
    String(programCheck.doc.department) !== departmentCheck.id
  ) {
    return { error: "Program does not belong to selected department" };
  }

  const payload = {
    course: courseId,
    academicYear: academicYear.trim(),
    semester: parsedSemester,
    dayOfWeek,
    startTime,
    endTime,
    venue: venue.trim(),
    lecturerName:
      typeof lecturerName === "string" ? lecturerName.trim() : "",
  };

  payload.faculty = facultyCheck.id || courseDoc.facultyRef || null;
  payload.department = departmentCheck.id || courseDoc.departmentRef || null;
  payload.program = programCheck.id || courseDoc.programRef || null;
  if (isActive !== undefined) payload.isActive = isActive;

  return { payload };
};

const buildAdminFilter = (query) => {
  const filter = {};

  if (query.faculty) filter.faculty = query.faculty;
  if (query.department) filter.department = query.department;
  if (query.program) filter.program = query.program;
  if (query.semester) filter.semester = Number(query.semester);
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.isActive === "true") filter.isActive = true;
  if (query.isActive === "false") filter.isActive = false;

  return filter;
};

exports.createEntry = async (req, res) => {
  const { error, payload } = await buildEntryPayload(req.body);
  if (error) return badRequest(res, error);

  const entry = await TimetableEntry.create(payload);
  const populated = await populateEntry(TimetableEntry.findById(entry._id));

  res.status(201).json({ status: "success", data: { entry: populated } });
};

exports.getEntries = async (req, res) => {
  const entries = await populateEntry(
    TimetableEntry.find(buildAdminFilter(req.query)),
  ).sort({ academicYear: -1, semester: 1, dayOfWeek: 1, startTime: 1 });

  res.status(200).json({
    status: "success",
    results: entries.length,
    data: { entries },
  });
};

exports.updateEntry = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid timetable entry ID");
  }

  const existing = await TimetableEntry.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      status: "fail",
      message: "Timetable entry not found",
    });
  }

  const { error, payload } = await buildEntryPayload({
    course: existing.course,
    faculty: existing.faculty,
    department: existing.department,
    program: existing.program,
    academicYear: existing.academicYear,
    semester: existing.semester,
    dayOfWeek: existing.dayOfWeek,
    startTime: existing.startTime,
    endTime: existing.endTime,
    venue: existing.venue,
    lecturerName: existing.lecturerName,
    isActive: existing.isActive,
    ...req.body,
  });
  if (error) return badRequest(res, error);

  const updated = await populateEntry(
    TimetableEntry.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }),
  );

  res.status(200).json({ status: "success", data: { entry: updated } });
};

exports.deleteEntry = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid timetable entry ID");
  }

  const updated = await populateEntry(
    TimetableEntry.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true },
    ),
  );

  if (!updated) {
    return res.status(404).json({
      status: "fail",
      message: "Timetable entry not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Timetable entry deactivated.",
    data: { entry: updated },
  });
};

exports.getMyTimetable = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const activeSession = await AcademicSession.findOne({ isActive: true }).sort({
    createdAt: -1,
  });

  const approvedEnrollments = await Enrollment.find({
    student: req.user._id,
    status: "approved",
    ...(activeSession
      ? {
          academicYear: activeSession.academicYear,
          semester: activeSession.semester,
        }
      : {}),
  }).select("courses academicYear semester");

  const approvedCourseIds = approvedEnrollments.flatMap((enrollment) =>
    enrollment.courses.map((course) => course),
  );

  const courseFilter = { isActive: true };
  if (activeSession) courseFilter.semester = activeSession.semester;
  if (profile?.department) courseFilter.department = profile.department;
  if (profile?.program) courseFilter.program = profile.program;

  const profileCourses =
    profile?.department || profile?.program
      ? await Course.find(courseFilter).select("_id")
      : [];
  const profileCourseIds = profileCourses.map((course) => course._id);
  const courseIds = [...approvedCourseIds, ...profileCourseIds];

  const filter = { isActive: true };
  if (activeSession) {
    filter.academicYear = activeSession.academicYear;
    filter.semester = activeSession.semester;
  }

  filter.course = { $in: courseIds };

  const entries = await populateEntry(TimetableEntry.find(filter)).sort({
    dayOfWeek: 1,
    startTime: 1,
  });

  res.status(200).json({
    status: "success",
    results: entries.length,
    data: {
      entries,
      activeSession,
      profile,
    },
  });
};
