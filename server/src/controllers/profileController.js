const StudentProfile = require("../models/StudentProfile");

exports.getMyProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });

  res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
};

exports.updateMyProfile = async (req, res) => {
  let profile = await StudentProfile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await StudentProfile.create({
      user: req.user._id,
      ...req.body,
    });
  } else {
    profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
};
