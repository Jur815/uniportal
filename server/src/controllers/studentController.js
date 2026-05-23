const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const formatStudent = (user, profile) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || "active",
  createdAt: user.createdAt,
  profile: profile || null,
});

const normalize = (value) =>
  typeof value === "string" ? value.trim() : "";

const generateTemporaryPassword = () =>
  `Student-${crypto.randomBytes(9).toString("base64url")}1!`;

const parseOptionalDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

exports.createStudent = async (req, res) => {
  const {
    fullName,
    name,
    email,
    password,
    studentId,
    registrationNumber,
    faculty,
    department,
    program,
    level,
    yearOfStudy,
    intakeYear,
    phone,
    gender,
    dateOfBirth,
    address,
    guardianName,
    guardianPhone,
  } = req.body;
  const trimmedName = normalize(fullName || name);
  const normalizedEmail =
    typeof email === "string" ? email.toLowerCase().trim() : "";
  const normalizedStudentId = normalize(studentId);
  const normalizedRegistrationNumber = normalize(registrationNumber);
  const normalizedFaculty = normalize(faculty);
  const normalizedDepartment = normalize(department);
  const normalizedProgram = normalize(program);
  const parsedLevel = Number(level || yearOfStudy);
  const parsedYearOfStudy = yearOfStudy ? Number(yearOfStudy) : parsedLevel;
  const parsedIntakeYear = intakeYear ? Number(intakeYear) : undefined;
  const parsedDateOfBirth = parseOptionalDate(dateOfBirth);
  const hasProvidedPassword = typeof password === "string" && password.trim();
  const temporaryPassword = hasProvidedPassword
    ? undefined
    : generateTemporaryPassword();
  const studentPassword = hasProvidedPassword ? password : temporaryPassword;

  if (!trimmedName) return badRequest(res, "Full name is required");
  if (!normalizedEmail) return badRequest(res, "Email is required");
  if (!validator.isEmail(normalizedEmail)) {
    return badRequest(res, "Please provide a valid email");
  }
  if (!studentPassword || studentPassword.length < 6) {
    return badRequest(res, "Password must be at least 6 characters");
  }
  if (!normalizedStudentId && !normalizedRegistrationNumber) {
    return badRequest(res, "Student ID or registration number is required");
  }
  if (!normalizedFaculty) return badRequest(res, "Faculty is required");
  if (!normalizedDepartment) return badRequest(res, "Department is required");
  if (!normalizedProgram) return badRequest(res, "Program is required");
  if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
    return badRequest(res, "Level/year must be a number between 1 and 6");
  }
  if (
    parsedYearOfStudy &&
    (!Number.isInteger(parsedYearOfStudy) ||
      parsedYearOfStudy < 1 ||
      parsedYearOfStudy > 6)
  ) {
    return badRequest(res, "yearOfStudy must be a number between 1 and 6");
  }
  if (
    parsedIntakeYear &&
    (!Number.isInteger(parsedIntakeYear) ||
      parsedIntakeYear < 1900 ||
      parsedIntakeYear > 3000)
  ) {
    return badRequest(res, "intakeYear must be a valid year");
  }
  if (parsedDateOfBirth === null) {
    return badRequest(res, "dateOfBirth must be a valid date");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return badRequest(res, "Email already registered");

  if (normalizedStudentId) {
    const existingStudentId = await StudentProfile.findOne({
      studentId: normalizedStudentId,
    });
    if (existingStudentId) return badRequest(res, "Student ID already exists");
  }

  if (normalizedRegistrationNumber) {
    const existingRegistration = await StudentProfile.findOne({
      registrationNumber: normalizedRegistrationNumber,
    });
    if (existingRegistration) {
      return badRequest(res, "Registration number already exists");
    }
  }

  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password: studentPassword,
    role: "student",
    status: "active",
  });

  try {
    const profile = await StudentProfile.create({
      user: user._id,
      studentId: normalizedStudentId || undefined,
      registrationNumber: normalizedRegistrationNumber || undefined,
      faculty: normalizedFaculty,
      department: normalizedDepartment,
      program: normalizedProgram,
      level: parsedLevel,
      yearOfStudy: parsedYearOfStudy,
      intakeYear: parsedIntakeYear,
      phone: normalize(phone),
      gender: normalize(gender),
      dateOfBirth: parsedDateOfBirth,
      address: normalize(address),
      guardianName: normalize(guardianName),
      guardianPhone: normalize(guardianPhone),
      academicVerified: true,
    });

    return res.status(201).json({
      status: "success",
      message: "Student created successfully.",
      data: {
        student: formatStudent(user, profile.toObject()),
        temporaryPassword,
      },
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);

    if (err.code === 11000) {
      return badRequest(
        res,
        "Student ID or registration number already exists",
      );
    }

    throw err;
  }
};

exports.getStudents = async (req, res) => {
  const userFilter = { role: "student" };
  const profileFilter = {};
  const search = normalize(req.query.search);

  if (req.query.status) {
    if (!["active", "suspended"].includes(req.query.status)) {
      return badRequest(res, "status must be active or suspended");
    }
    if (req.query.status === "active") {
      userFilter.$and = [
        ...(userFilter.$and || []),
        { $or: [{ status: "active" }, { status: { $exists: false } }] },
      ];
    } else {
      userFilter.status = req.query.status;
    }
  }

  for (const field of ["faculty", "department", "program"]) {
    const value = normalize(req.query[field]);
    if (value) profileFilter[field] = value;
  }

  if (search) {
    const matchingProfiles = await StudentProfile.find({
      $or: [
        { studentId: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ],
    }).select("user");
    const profileUserIds = matchingProfiles.map((profile) => profile.user);

    const searchFilter = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { _id: { $in: profileUserIds } },
    ];

    userFilter.$and = [...(userFilter.$and || []), { $or: searchFilter }];
  }

  let users = await User.find(userFilter).select("-password").sort("name");
  const profiles = await StudentProfile.find({
    user: { $in: users.map((user) => user._id) },
    ...profileFilter,
  });
  const profileMap = new Map(
    profiles.map((profile) => [String(profile.user), profile.toObject()]),
  );

  if (Object.keys(profileFilter).length > 0) {
    users = users.filter((user) => profileMap.has(String(user._id)));
  }

  const students = users.map((user) =>
    formatStudent(user, profileMap.get(String(user._id))),
  );

  res.status(200).json({
    status: "success",
    results: students.length,
    data: { students },
  });
};

exports.getStudent = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid student ID");
  }

  const user = await User.findOne({
    _id: req.params.id,
    role: "student",
  }).select("-password");

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Student not found",
    });
  }

  const profile = await StudentProfile.findOne({ user: user._id });

  res.status(200).json({
    status: "success",
    data: { student: formatStudent(user, profile?.toObject()) },
  });
};

exports.updateStudentStatus = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid student ID");
  }

  const { status } = req.body;

  if (!["active", "suspended"].includes(status)) {
    return badRequest(res, "status must be active or suspended");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "student" },
    { status },
    { returnDocument: "after", runValidators: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Student not found",
    });
  }

  const profile = await StudentProfile.findOne({ user: user._id });

  res.status(200).json({
    status: "success",
    data: { student: formatStudent(user, profile?.toObject()) },
  });
};

exports.updateAcademicVerification = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid student ID");
  }

  const { academicVerified } = req.body;

  if (typeof academicVerified !== "boolean") {
    return badRequest(res, "academicVerified must be a boolean");
  }

  const user = await User.findOne({ _id: req.params.id, role: "student" });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Student not found",
    });
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { user: user._id },
    { academicVerified },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  res.status(200).json({
    status: "success",
    data: { student: formatStudent(user, profile.toObject()) },
  });
};
