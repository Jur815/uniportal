const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const {
  COMPLAINT_TYPES,
  COMPLAINT_STATUSES,
} = require("../models/Complaint");

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

const complaintPopulate = [
  { path: "student", select: "name email role status" },
  { path: "handledBy", select: "name email role" },
];

const getPopulatedComplaint = (complaintId) =>
  Complaint.findById(complaintId).populate(complaintPopulate);

exports.createComplaint = async (req, res) => {
  const { complaintType, subject, description } = req.body;

  if (!COMPLAINT_TYPES.includes(complaintType)) {
    return badRequest(res, "Valid complaintType is required");
  }

  if (!subject || !subject.trim()) {
    return badRequest(res, "Subject is required");
  }

  if (!description || !description.trim()) {
    return badRequest(res, "Description is required");
  }

  const complaint = await Complaint.create({
    student: req.user._id,
    complaintType,
    subject: subject.trim(),
    description: description.trim(),
  });

  const populated = await getPopulatedComplaint(complaint._id);

  res.status(201).json({
    status: "success",
    message: "Complaint submitted successfully.",
    data: { complaint: populated },
  });
};

exports.getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ student: req.user._id })
    .populate(complaintPopulate)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: complaints.length,
    data: { complaints },
  });
};

exports.getComplaints = async (req, res) => {
  const filter = {};
  const { status } = req.query;

  if (status && status !== "all") {
    if (!COMPLAINT_STATUSES.includes(status)) {
      return badRequest(res, "Invalid complaint status filter");
    }
    filter.status = status;
  }

  const complaints = await Complaint.find(filter)
    .populate(complaintPopulate)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: complaints.length,
    data: { complaints },
  });
};

exports.updateComplaint = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return badRequest(res, "Invalid complaint ID");
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      status: "fail",
      message: "Complaint not found",
    });
  }

  if (req.body.status !== undefined) {
    if (!COMPLAINT_STATUSES.includes(req.body.status)) {
      return badRequest(res, "Invalid complaint status");
    }
    complaint.status = req.body.status;
  }

  if (req.body.response !== undefined) {
    complaint.response = String(req.body.response || "").trim();
  }

  complaint.handledBy = req.user._id;
  await complaint.save();

  const populated = await getPopulatedComplaint(complaint._id);

  res.status(200).json({
    status: "success",
    message: "Complaint updated successfully.",
    data: { complaint: populated },
  });
};
