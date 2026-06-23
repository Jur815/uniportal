const mongoose = require("mongoose");
const AcademicRecord = require("../models/AcademicRecord");
const GradingPolicy = require("../models/GradingPolicy");
const StudentProfile = require("../models/StudentProfile");
const {
  DEFAULT_POLICY,
  calculateCgpa,
  calculateSemesterResult,
  formatInstitutionalRemark,
  getPolicySnapshot,
  isCourseResultEntered,
  validateResultForRelease,
  verifyResultMetrics,
} = require("../services/resultCalculationService");

const STAFF_ROLES = ["admin", "registrar", "lecturer", "dean_hod"];
const STANDINGS = [
  "Pass",
  "Supplementary",
  "Carry Over",
  "Repeat",
  "Discontinued",
  "Suspended",
];

const populateRecord = [
  { path: "student", select: "name email role status" },
  { path: "enrollment", select: "status academicYear semester" },
  { path: "submittedBy reviewedBy finalizedBy releasedBy", select: "name email role" },
  { path: "auditLog.actor", select: "name email role" },
];

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const notFound = (res, message = "Academic result not found") =>
  res.status(404).json({ status: "fail", message });

const getActivePolicy = async () =>
  (await GradingPolicy.findOne({ isActive: true })) || DEFAULT_POLICY;

const audit = (req, action, options = {}) => ({
  action,
  actor: req.user._id,
  actorRole: req.user.role,
  occurredAt: new Date(),
  course: options.course,
  previousValue: options.previousValue,
  newValue: options.newValue,
  note:
    typeof options.note === "string"
      ? options.note.trim().slice(0, 500)
      : undefined,
});

const enrichRecords = async (records) => {
  const ids = records
    .map((record) => record.student?._id || record.student)
    .filter(Boolean);
  const profiles = await StudentProfile.find({ user: { $in: ids } });
  const profileMap = new Map(
    profiles.map((profile) => [String(profile.user), profile.toObject()]),
  );

  const finalizedRecords = await AcademicRecord.find({
    student: { $in: ids },
    workflowStatus: { $in: ["registrar_finalized", "released"] },
  });
  const recordsByStudent = new Map();
  for (const record of finalizedRecords) {
    const studentId = String(record.student);
    if (!recordsByStudent.has(studentId)) recordsByStudent.set(studentId, []);
    recordsByStudent.get(studentId).push(record);
  }

  return records.map((record) => {
    const plain = record.toObject();
    const studentId = record.student?._id || record.student;
    const verificationRecords = [
      ...(recordsByStudent.get(String(studentId)) || []),
    ];
    if (
      !verificationRecords.some(
        (item) => String(item._id) === String(record._id),
      )
    ) {
      verificationRecords.push(record);
    }
    const verification = verifyResultMetrics(
      plain,
      verificationRecords,
    );
    return {
      ...plain,
      studentProfile: profileMap.get(String(studentId)) || null,
      supplementaryCourses: plain.courses.filter(
        (course) => course.isSupplementary,
      ),
      carryOverCourses: plain.courses.filter((course) => course.isCarryOver),
      resultVerification: verification,
    };
  });
};

const getStudentFinalizedRecords = (studentId) =>
  AcademicRecord.find({
    student: studentId,
    workflowStatus: { $in: ["registrar_finalized", "released"] },
  });

const recomputeStudentCgpa = async (studentId) => {
  const records = await AcademicRecord.find({
    student: studentId,
    workflowStatus: { $in: ["registrar_finalized", "released"] },
  });
  const CGPA = calculateCgpa(records);
  await AcademicRecord.updateMany({ student: studentId }, { $set: { CGPA } });
  return CGPA;
};

exports.getPolicy = async (req, res) => {
  const policy = await getActivePolicy();
  res.status(200).json({
    status: "success",
    data: { policy: getPolicySnapshot(policy) },
  });
};

exports.upsertPolicy = async (req, res) => {
  const { name, gradeBands, promotionRules, specialResultCodes = [] } = req.body;
  if (!name || !Array.isArray(gradeBands) || gradeBands.length === 0) {
    return badRequest(res, "name and gradeBands[] are required");
  }

  const normalizedBands = gradeBands.map((band) => ({
    minMark: Number(band.minMark),
    maxMark: Number(band.maxMark),
    grade: String(band.grade || "").trim(),
    gradePoint: Number(band.gradePoint),
    isPass: Boolean(band.isPass),
  }));

  const invalidBand = normalizedBands.some(
    (band) =>
      Number.isNaN(band.minMark) ||
      Number.isNaN(band.maxMark) ||
      band.minMark < 0 ||
      band.maxMark > 100 ||
      band.minMark > band.maxMark ||
      !band.grade ||
      Number.isNaN(band.gradePoint),
  );
  if (invalidBand) return badRequest(res, "One or more grade bands are invalid");

  const normalizedCodes = specialResultCodes.map((item) => ({
    code: String(item.code || "").trim(),
    label: String(item.label || "").trim(),
    progressionEffect: String(item.progressionEffect || "none"),
    gradePoint:
      item.gradePoint === "" ||
      item.gradePoint === null ||
      item.gradePoint === undefined
        ? undefined
        : Number(item.gradePoint),
    isActive: item.isActive !== false,
  }));
  const validEffects = new Set([
    "none",
    "failed",
    "carry_over",
    "suspended",
    "incomplete",
  ]);
  const duplicateCodes =
    new Set(normalizedCodes.map((item) => item.code)).size !==
    normalizedCodes.length;
  const invalidCode = normalizedCodes.some(
    (item) =>
      !item.code ||
      !item.label ||
      !validEffects.has(item.progressionEffect) ||
      (item.gradePoint !== undefined &&
        (Number.isNaN(item.gradePoint) ||
          item.gradePoint < 0 ||
          item.gradePoint > 5)),
  );
  if (invalidCode || duplicateCodes) {
    return badRequest(res, "One or more special result codes are invalid");
  }

  const policy = await GradingPolicy.create({
    name: String(name).trim(),
    gradeBands: normalizedBands,
    specialResultCodes: normalizedCodes,
    promotionRules,
    isActive: false,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  await GradingPolicy.updateMany(
    { _id: { $ne: policy._id }, isActive: true },
    { $set: { isActive: false, updatedBy: req.user._id } },
  );
  policy.isActive = true;
  await policy.save();

  res.status(200).json({
    status: "success",
    message: "Grading and promotion policy updated.",
    data: { policy: getPolicySnapshot(policy) },
  });
};

exports.getRecords = async (req, res) => {
  const filter = {};
  if (req.query.workflowStatus) filter.workflowStatus = req.query.workflowStatus;
  if (req.query.academicStanding) {
    if (!STANDINGS.includes(req.query.academicStanding)) {
      return badRequest(res, "Invalid academicStanding");
    }
    filter.academicStanding = req.query.academicStanding;
  }
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.student) {
    if (!mongoose.Types.ObjectId.isValid(req.query.student)) {
      return badRequest(res, "Invalid student ID");
    }
    filter.student = req.query.student;
  }

  const records = await AcademicRecord.find(filter)
    .populate(populateRecord)
    .sort({ academicYear: -1, semester: -1, createdAt: -1 });
  const enriched = await enrichRecords(records);
  res.status(200).json({
    status: "success",
    results: enriched.length,
    data: { records: enriched },
  });
};

exports.getMyReleasedResults = async (req, res) => {
  const records = await AcademicRecord.find({
    student: req.user._id,
    workflowStatus: "released",
  })
    .populate(populateRecord)
    .sort({ academicYear: -1, semester: -1 });
  const enriched = await enrichRecords(records);
  res.status(200).json({
    status: "success",
    results: enriched.length,
    data: { records: enriched },
  });
};

exports.enterMarks = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid academic record ID");
  }
  const record = await AcademicRecord.findById(req.params.id);
  if (!record) return notFound(res);
  if (!["draft", "returned"].includes(record.workflowStatus)) {
    return badRequest(res, "Marks can only be edited while results are draft or returned");
  }
  if (!Array.isArray(req.body.courses)) {
    return badRequest(res, "courses[] is required");
  }

  const policy = await getActivePolicy();
  const updates = new Map();
  for (const item of req.body.courses) {
    const courseId = String(item.course || "");
    const resultCode = String(item.resultCode || "").trim();
    const marks =
      resultCode || item.marks === "" || item.marks === undefined
        ? undefined
        : Number(item.marks);
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return badRequest(res, "Each mark entry requires a valid course ID");
    }
    if (
      marks !== undefined &&
      (Number.isNaN(marks) || marks < 0 || marks > 100)
    ) {
      return badRequest(res, "Marks must be between 0 and 100");
    }
    updates.set(courseId, { marks, resultCode: resultCode || undefined });
  }

  const previousCourses = record.courses.map((course) => course.toObject());
  const nextCourses = record.courses.map((course) => {
    const plain = course.toObject();
    if (!updates.has(String(course.course))) return plain;
    return { ...plain, ...updates.get(String(course.course)) };
  });
  let calculation;
  try {
    calculation = calculateSemesterResult(nextCourses, policy);
  } catch (err) {
    return badRequest(res, err.message);
  }

  record.courses = calculation.courses;
  record.GPA = calculation.GPA;
  record.earnedCredits = calculation.earnedCredits;
  record.failedCourseCount = calculation.failedCourseCount;
  record.academicStanding = calculation.academicStanding;
  record.isDeansList = calculation.isDeansList;
  record.institutionalRemark = calculation.institutionalRemark;
  record.gradingPolicy = policy._id;
  record.gradingPolicySnapshot = calculation.gradingPolicySnapshot;
  record.totalCredits = record.courses.reduce(
    (sum, course) => sum + Number(course.creditHours || 0),
    0,
  );
  if (typeof req.body.remarks === "string") {
    const previousRemarks = record.remarks;
    record.remarks = req.body.remarks.trim().slice(0, 500);
    if (previousRemarks !== record.remarks) {
      record.auditLog.push(
        audit(req, "remarks_updated", {
          previousValue: previousRemarks,
          newValue: record.remarks,
          note: req.body.note,
        }),
      );
    }
  }

  for (const course of calculation.courses) {
    const previous = previousCourses.find(
      (item) => String(item.course) === String(course.course),
    );
    if (
      previous?.marks !== course.marks ||
      previous?.resultCode !== course.resultCode
    ) {
      record.auditLog.push(
        audit(req, "marks_updated", {
          course: course.course,
          previousValue: {
            marks: previous?.marks,
            resultCode: previous?.resultCode,
          },
          newValue: {
            marks: course.marks,
            grade: course.grade,
            gradePoint: course.gradePoint,
            resultCode: course.resultCode,
            status: course.status,
          },
          note: req.body.note,
        }),
      );
    }
  }

  await record.save();
  const populated = await AcademicRecord.findById(record._id).populate(populateRecord);
  const [enriched] = await enrichRecords([populated]);
  res.status(200).json({
    status: "success",
    message: "Course marks and calculated results updated.",
    data: { record: enriched },
  });
};

exports.transitionWorkflow = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid academic record ID");
  }
  const record = await AcademicRecord.findById(req.params.id);
  if (!record) return notFound(res);
  const action = req.body.action;
  const transitions = {
    submit: {
      roles: ["lecturer", "admin", "registrar"],
      from: ["draft", "returned"],
      to: "lecturer_submitted",
    },
    review: {
      roles: ["dean_hod", "admin"],
      from: ["lecturer_submitted"],
      to: "dean_hod_reviewed",
    },
    finalize: {
      roles: ["registrar", "admin"],
      from: ["dean_hod_reviewed"],
      to: "registrar_finalized",
    },
    release: {
      roles: ["registrar", "admin"],
      from: ["registrar_finalized"],
      to: "released",
    },
    return: {
      roles: ["dean_hod", "registrar", "admin"],
      from: ["lecturer_submitted", "dean_hod_reviewed", "registrar_finalized"],
      to: "returned",
    },
  };
  const transition = transitions[action];
  if (!transition) return badRequest(res, "Invalid workflow action");
  if (!transition.roles.includes(req.user.role)) {
    return res.status(403).json({ status: "fail", message: "You do not have permission for this workflow action" });
  }
  if (!transition.from.includes(record.workflowStatus)) {
    return badRequest(
      res,
      `Cannot ${action} results from ${record.workflowStatus} status`,
    );
  }
  const resultPolicy = record.gradingPolicySnapshot || (await getActivePolicy());
  if (
    action === "submit" &&
    record.courses.some(
      (course) => !isCourseResultEntered(course, resultPolicy),
    )
  ) {
    return badRequest(res, "All course marks are required before submission");
  }
  if (
    ["review", "finalize", "release"].includes(action) &&
    record.courses.some(
      (course) => !isCourseResultEntered(course, resultPolicy),
    )
  ) {
    return badRequest(res, "Complete marks or configured result codes are required");
  }
  if (action === "finalize" && (!record.submittedBy || !record.reviewedBy)) {
    return badRequest(
      res,
      "Lecturer submission and Dean/HOD review are required before finalization",
    );
  }
  if (action === "release") {
    const finalizedRecords = await getStudentFinalizedRecords(record.student);
    const validation = validateResultForRelease(record, finalizedRecords);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "fail",
        message:
          "Result verification or approval checks failed. Correct the result before release.",
        data: { validation },
      });
    }
  }

  const previousStatus = record.workflowStatus;
  const previousStanding = record.academicStanding;
  if (
    action === "finalize" &&
    req.body.academicStanding !== undefined
  ) {
    if (!STANDINGS.includes(req.body.academicStanding)) {
      return badRequest(res, "Invalid academic standing override");
    }
    record.academicStanding = req.body.academicStanding;
    record.isDeansList =
      record.academicStanding === "Pass" && Boolean(record.isDeansList);
    record.institutionalRemark = formatInstitutionalRemark({
      academicStanding: record.academicStanding,
      failedCount: record.failedCourseCount,
      isDeansList: record.isDeansList,
    });
  }
  record.workflowStatus = transition.to;
  record.approvalNote =
    typeof req.body.note === "string"
      ? req.body.note.trim().slice(0, 500)
      : record.approvalNote;
  const now = new Date();
  if (action === "submit") {
    record.submittedBy = req.user._id;
    record.submittedAt = now;
  } else if (action === "review") {
    record.reviewedBy = req.user._id;
    record.reviewedAt = now;
  } else if (action === "finalize") {
    record.finalizedBy = req.user._id;
    record.finalizedAt = now;
  } else if (action === "release") {
    record.releasedBy = req.user._id;
    record.releasedAt = now;
  }
  record.auditLog.push(
    audit(req, `workflow_${action}`, {
      previousValue: {
        workflowStatus: previousStatus,
        academicStanding: previousStanding,
      },
      newValue: {
        workflowStatus: transition.to,
        academicStanding: record.academicStanding,
      },
      note: req.body.note,
    }),
  );
  await record.save();
  record.CGPA = await recomputeStudentCgpa(record.student);
  await record.save();

  const populated = await AcademicRecord.findById(record._id).populate(populateRecord);
  const [enriched] = await enrichRecords([populated]);
  res.status(200).json({
    status: "success",
    message: `Results ${action} action completed.`,
    data: { record: enriched },
  });
};

exports.getReports = async (req, res) => {
  const match = {};
  if (req.query.academicYear) match.academicYear = req.query.academicYear;
  if (req.query.semester) match.semester = Number(req.query.semester);
  if (req.query.department) {
    const profiles = await StudentProfile.find({
      department: req.query.department,
    }).select("user");
    match.student = { $in: profiles.map((profile) => profile.user) };
  }

  const records = await AcademicRecord.find(match)
    .populate(populateRecord)
    .sort({ academicStanding: 1, academicYear: -1 });
  const enriched = await enrichRecords(records);
  const released = enriched.filter(
    (record) => record.workflowStatus === "released",
  );

  const byStanding = Object.fromEntries(
    STANDINGS.map((standing) => [
      standing,
      released.filter((record) => record.academicStanding === standing),
    ]),
  );
  const departmentMap = new Map();
  for (const record of released) {
    const department = record.studentProfile?.department || "Unassigned";
    const current = departmentMap.get(department) || {
      department,
      students: 0,
      totalGpa: 0,
      pass: 0,
      supplementary: 0,
      carryOver: 0,
      repeatOrDiscontinued: 0,
    };
    current.students += 1;
    current.totalGpa += Number(record.GPA || 0);
    if (record.academicStanding === "Pass") current.pass += 1;
    if (record.academicStanding === "Supplementary") current.supplementary += 1;
    if (record.academicStanding === "Carry Over") current.carryOver += 1;
    if (["Repeat", "Discontinued"].includes(record.academicStanding)) {
      current.repeatOrDiscontinued += 1;
    }
    departmentMap.set(department, current);
  }

  const departmentPerformance = [...departmentMap.values()].map((row) => ({
    ...row,
    averageGpa:
      row.students > 0
        ? Math.round((row.totalGpa / row.students) * 100) / 100
        : 0,
  }));

  res.status(200).json({
    status: "success",
    data: {
      supplementaryList: byStanding.Supplementary,
      carryOverList: byStanding["Carry Over"],
      passList: byStanding.Pass,
      repeatDiscontinuedList: [
        ...byStanding.Repeat,
        ...byStanding.Discontinued,
      ],
      departmentPerformance,
    },
  });
};

exports.requireStaffRole = (req, res, next) => {
  if (!STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ status: "fail", message: "You do not have permission" });
  }
  next();
};
