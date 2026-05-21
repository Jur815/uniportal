const mongoose = require("mongoose");
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
      studentId: { $regex: search, $options: "i" },
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
    { new: true, runValidators: true },
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
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  res.status(200).json({
    status: "success",
    data: { student: formatStudent(user, profile.toObject()) },
  });
};
