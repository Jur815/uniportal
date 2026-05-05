const StudentProfile = require("../models/StudentProfile");

const allowedProfileFields = [
  "studentId",
  "faculty",
  "department",
  "program",
  "level",
  "phone",
];

const textProfileFields = allowedProfileFields.filter(
  (field) => field !== "level",
);

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
    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      payload,
      { new: true, runValidators: true },
    );
  }

  res.status(200).json({
    status: "success",
    data: formatProfileResponse(req.user, profile),
  });
};
