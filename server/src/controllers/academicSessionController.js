const AcademicSession = require("../models/AcademicSession");
const mongoose = require("mongoose");

const YEAR_PATTERN = /^\d{4}\/\d{4}$/;

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const buildPayload = (body) => {
  const {
    academicYear,
    semester,
    registrationOpen,
    enrollmentStatus,
    startDate,
    endDate,
    isActive,
    notes,
  } = body;

  if (typeof academicYear !== "string" || !YEAR_PATTERN.test(academicYear.trim())) {
    return { error: "academicYear must use YYYY/YYYY format" };
  }

  const parsedSemester = Number(semester);
  if (![1, 2].includes(parsedSemester)) {
    return { error: "semester must be 1 or 2" };
  }

  if (registrationOpen !== undefined && typeof registrationOpen !== "boolean") {
    return { error: "registrationOpen must be a boolean" };
  }

  if (
    enrollmentStatus !== undefined &&
    !["open", "closed"].includes(enrollmentStatus)
  ) {
    return { error: "enrollmentStatus must be open or closed" };
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    return { error: "isActive must be a boolean" };
  }

  const payload = {
    academicYear: academicYear.trim(),
    semester: parsedSemester,
  };

  if (enrollmentStatus !== undefined) {
    payload.enrollmentStatus = enrollmentStatus;
    payload.registrationOpen = enrollmentStatus === "open";
  } else if (registrationOpen !== undefined) {
    payload.registrationOpen = registrationOpen;
    payload.enrollmentStatus = registrationOpen ? "open" : "closed";
  }

  if (isActive !== undefined) payload.isActive = isActive;
  if (startDate) payload.startDate = new Date(startDate);
  if (endDate) payload.endDate = new Date(endDate);
  if (typeof notes === "string") payload.notes = notes.trim();

  if (
    payload.startDate &&
    Number.isNaN(payload.startDate.getTime())
  ) {
    return { error: "startDate must be a valid date" };
  }

  if (payload.endDate && Number.isNaN(payload.endDate.getTime())) {
    return { error: "endDate must be a valid date" };
  }

  if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
    return { error: "endDate must be after startDate" };
  }

  return { payload };
};

const activateSessionIfNeeded = async (session) => {
  if (!session.isActive) return;

  await AcademicSession.updateMany(
    { _id: { $ne: session._id }, isActive: true },
    { isActive: false },
  );
};

exports.getSessions = async (req, res) => {
  const sessions = await AcademicSession.find().sort({
    isActive: -1,
    academicYear: -1,
    semester: -1,
  });

  res.status(200).json({
    status: "success",
    results: sessions.length,
    data: { sessions },
  });
};

exports.getActiveSession = async (req, res) => {
  const session = await AcademicSession.findOne({ isActive: true }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    data: { session },
  });
};

exports.createSession = async (req, res) => {
  const { error, payload } = buildPayload(req.body);

  if (error) return badRequest(res, error);

  try {
    const session = await AcademicSession.create(payload);
    await activateSessionIfNeeded(session);

    res.status(201).json({
      status: "success",
      data: { session },
    });
  } catch (err) {
    if (err.code === 11000) {
      return badRequest(res, "Academic session already exists");
    }
    throw err;
  }
};

exports.updateSession = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid academic session ID");
  }

  const existing = await AcademicSession.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({
      status: "fail",
      message: "Academic session not found",
    });
  }

  const mergedBody = {
    academicYear: existing.academicYear,
    semester: existing.semester,
    registrationOpen: existing.registrationOpen,
    enrollmentStatus:
      existing.enrollmentStatus ||
      (existing.registrationOpen ? "open" : "closed"),
    isActive: existing.isActive,
    startDate: existing.startDate,
    endDate: existing.endDate,
    notes: existing.notes,
    ...req.body,
  };
  const { error, payload } = buildPayload(mergedBody);

  if (error) return badRequest(res, error);

  const session = await AcademicSession.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  await activateSessionIfNeeded(session);

  res.status(200).json({
    status: "success",
    data: { session },
  });
};
