const StudentProfile = require("../models/StudentProfile");

exports.createOrUpdateMyProfile = async (req, res) => {
  const payload = { ...req.body, user: req.user._id };

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user._id },
    payload,
    { new: true, upsert: true, runValidators: true },
  );

  res.status(200).json({ status: "success", data: { profile } });
};

exports.getMyProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
    "user",
    "name email role",
  );
  res.status(200).json({ status: "success", data: { profile } });
};
