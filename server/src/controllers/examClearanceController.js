const mongoose = require("mongoose");
const ExamClearance = require("../models/ExamClearance");
const {
  CLEARANCE_STATUSES,
  FINANCIAL_CLEARANCE_STATUSES,
} = require("../models/ExamClearance");
const User = require("../models/User");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const populateClearance = (query) =>
  query
    .populate("student", "name email role status")
    .populate("reviewedBy", "name email role");

const buildFilter = (query) => {
  const filter = {};

  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.semester) filter.semester = Number(query.semester);
  if (query.status) filter.status = query.status;

  return filter;
};

const buildPayload = async (body, options = {}) => {
  const payload = {};

  if (body.student !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(body.student)) {
      return { error: "Valid student ID is required" };
    }

    const student = await User.findOne({ _id: body.student, role: "student" });
    if (!student) return { error: "Student not found" };
    payload.student = student._id;
  } else if (options.requireStudent) {
    return { error: "Student is required" };
  }

  if (body.academicYear !== undefined) {
    if (
      typeof body.academicYear !== "string" ||
      !/^\d{4}\/\d{4}$/.test(body.academicYear)
    ) {
      return { error: "academicYear must use YYYY/YYYY format" };
    }
    payload.academicYear = body.academicYear.trim();
  } else if (options.requireAcademicYear) {
    return { error: "Academic year is required" };
  }

  if (body.semester !== undefined) {
    const semester = Number(body.semester);
    if (![1, 2].includes(semester)) {
      return { error: "semester must be 1 or 2" };
    }
    payload.semester = semester;
  } else if (options.requireSemester) {
    return { error: "Semester is required" };
  }

  if (body.status !== undefined) {
    if (!CLEARANCE_STATUSES.includes(body.status)) {
      return { error: "Invalid exam clearance status" };
    }
    payload.status = body.status;
  }

  if (body.attendancePercentage !== undefined) {
    const attendancePercentage = Number(body.attendancePercentage);
    if (
      Number.isNaN(attendancePercentage) ||
      attendancePercentage < 0 ||
      attendancePercentage > 100
    ) {
      return { error: "attendancePercentage must be between 0 and 100" };
    }
    payload.attendancePercentage = attendancePercentage;
  }

  if (body.financialClearanceStatus !== undefined) {
    if (!FINANCIAL_CLEARANCE_STATUSES.includes(body.financialClearanceStatus)) {
      return { error: "Invalid financial clearance status" };
    }
    payload.financialClearanceStatus = body.financialClearanceStatus;
  }

  if (body.remarks !== undefined) {
    payload.remarks = String(body.remarks || "").trim();
  }

  return { payload };
};

exports.createClearance = async (req, res) => {
  const { error, payload } = await buildPayload(req.body, {
    requireStudent: true,
    requireAcademicYear: true,
    requireSemester: true,
  });
  if (error) return badRequest(res, error);

  payload.reviewedBy = req.user._id;
  payload.reviewedAt = new Date();

  try {
    const clearance = await ExamClearance.create(payload);
    const populated = await populateClearance(
      ExamClearance.findById(clearance._id),
    );

    res.status(201).json({
      status: "success",
      data: { clearance: populated },
    });
  } catch (err) {
    if (err.code === 11000) {
      return badRequest(
        res,
        "Exam clearance already exists for this student, academic year, and semester.",
      );
    }
    throw err;
  }
};

exports.getClearances = async (req, res) => {
  const filter = buildFilter(req.query);

  if (req.query.status && !CLEARANCE_STATUSES.includes(req.query.status)) {
    return badRequest(res, "Invalid exam clearance status filter");
  }

  if (req.query.semester && ![1, 2].includes(Number(req.query.semester))) {
    return badRequest(res, "semester filter must be 1 or 2");
  }

  const clearances = await populateClearance(ExamClearance.find(filter)).sort({
    academicYear: -1,
    semester: 1,
    updatedAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: clearances.length,
    data: { clearances },
  });
};

exports.updateClearance = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid exam clearance ID");
  }

  const existing = await ExamClearance.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      status: "fail",
      message: "Exam clearance record not found",
    });
  }

  const { error, payload } = await buildPayload(req.body);
  if (error) return badRequest(res, error);

  payload.reviewedBy = req.user._id;
  payload.reviewedAt = new Date();

  let updated;

  try {
    updated = await populateClearance(
      ExamClearance.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      }),
    );
  } catch (err) {
    if (err.code === 11000) {
      return badRequest(
        res,
        "Exam clearance already exists for this student, academic year, and semester.",
      );
    }
    throw err;
  }

  res.status(200).json({
    status: "success",
    data: { clearance: updated },
  });
};

exports.getMyClearances = async (req, res) => {
  const clearances = await populateClearance(
    ExamClearance.find({ student: req.user._id }),
  ).sort({
    academicYear: -1,
    semester: 1,
    updatedAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: clearances.length,
    data: { clearances },
  });
};
