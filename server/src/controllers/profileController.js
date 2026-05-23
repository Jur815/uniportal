const StudentProfile = require("../models/StudentProfile");

const allowedProfileFields = [
  "studentId",
  "registrationNumber",
  "faculty",
  "department",
  "program",
  "level",
  "yearOfStudy",
  "intakeYear",
  "phone",
  "guardianName",
  "guardianPhone",
];

const textProfileFields = allowedProfileFields.filter(
  (field) => !["level", "yearOfStudy", "intakeYear"].includes(field),
);
const protectedAcademicFields = [
  "studentId",
  "registrationNumber",
  "faculty",
  "department",
  "program",
  "level",
  "yearOfStudy",
  "intakeYear",
];

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const validateProfilePayload = (body) => {
  const payload = {};

  for (const field of textProfileFields) {
    if (body[field] === undefined) continue;

    if (typeof body[field] !== "string") {
      return { error: `${field} must be a string` };
    }

    const value = body[field].trim();

    if (value) {
      payload[field] = value;
    }
  }

  if (body.level !== undefined) {
    const level = Number(body.level);

    if (!Number.isInteger(level) || level < 1 || level > 6) {
      return { error: "level must be a number between 1 and 6" };
    }

    payload.level = level;
  }

  if (body.yearOfStudy !== undefined) {
    const yearOfStudy = Number(body.yearOfStudy);

    if (!Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 6) {
      return { error: "yearOfStudy must be a number between 1 and 6" };
    }

    payload.yearOfStudy = yearOfStudy;
  }

  if (body.intakeYear !== undefined && body.intakeYear !== "") {
    const intakeYear = Number(body.intakeYear);
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(intakeYear) ||
      intakeYear < 1900 ||
      intakeYear > currentYear + 1
    ) {
      return { error: "intakeYear must be a valid year" };
    }

    payload.intakeYear = intakeYear;
  }

  return { payload };
};

const formatProfileResponse = (user, profile) => {
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    user: userData,
    profile: profile
      ? {
          ...profile.toObject(),
          name: user.name,
          email: user.email,
        }
      : {
          name: user.name,
          email: user.email,
        },
  };
};

exports.getMyProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });

  res.status(200).json({
    status: "success",
    data: formatProfileResponse(req.user, profile),
  });
};

exports.updateMyProfile = async (req, res) => {
  const { error, payload } = validateProfilePayload(req.body);

  if (error) {
    return badRequest(res, error);
  }

  let profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await StudentProfile.create({
      user: req.user._id,
      ...payload,
    });
  } else {
    if (profile.academicVerified) {
      const attemptedProtectedUpdate = protectedAcademicFields.some(
        (field) =>
          Object.prototype.hasOwnProperty.call(payload, field) &&
          String(payload[field] ?? "") !== String(profile[field] ?? ""),
      );

      if (attemptedProtectedUpdate) {
        return badRequest(
          res,
          "Academic fields are verified and can only be changed by administration",
        );
      }
    }

    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      payload,
      { returnDocument: "after", runValidators: true },
    );
  }

  res.status(200).json({
    status: "success",
    data: formatProfileResponse(req.user, profile),
  });
};
