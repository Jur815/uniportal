const AcademicSession = require("../models/AcademicSession");
const Course = require("../models/Course");
const Department = require("../models/departmentModel");
const Enrollment = require("../models/Enrollment");
const Faculty = require("../models/facultyModel");
const Program = require("../models/programModel");
const User = require("../models/User");

exports.getAdminKpis = async (req, res) => {
  const [
    totalStudents,
    totalFaculties,
    totalDepartments,
    totalPrograms,
    totalCourses,
    totalEnrollments,
    pendingEnrollments,
    approvedEnrollments,
    rejectedEnrollments,
    correctionEnrollments,
    activeAcademicSession,
    latestEnrollments,
    latestStudents,
    latestCourses,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Faculty.countDocuments(),
    Department.countDocuments(),
    Program.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: "pending" }),
    Enrollment.countDocuments({ status: "approved" }),
    Enrollment.countDocuments({ status: "rejected" }),
    Enrollment.countDocuments({ status: "correction_required" }),
    AcademicSession.findOne({ isActive: true }).sort({ createdAt: -1 }),
    Enrollment.find()
      .populate("student", "name email")
      .populate("courses", "title code creditHours")
      .sort({ createdAt: -1 })
      .limit(5),
    User.find({ role: "student" })
      .select("name email status createdAt")
      .sort({ createdAt: -1 })
      .limit(5),
    Course.find()
      .select("title code creditHours semester level isActive department facultyRef departmentRef")
      .populate("facultyRef", "name code")
      .populate("departmentRef", "name code")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const enrollmentOpen =
    activeAcademicSession?.enrollmentStatus === "open" ||
    activeAcademicSession?.registrationOpen === true;

  res.status(200).json({
    status: "success",
    data: {
      kpis: {
        totalStudents,
        totalFaculties,
        totalDepartments,
        totalPrograms,
        totalCourses,
        totalEnrollments,
        pendingEnrollments,
        approvedEnrollments,
        rejectedEnrollments,
        correctionEnrollments,
        activeAcademicSession,
        enrollmentStatus: enrollmentOpen ? "open" : "closed",
        recentActivity: {
          latestEnrollments,
          latestStudents,
          latestCourses,
        },
      },
    },
  });
};

const countDecisionsToday = async (newStatus, startOfToday, endOfToday) => {
  const [result] = await Enrollment.aggregate([
    { $unwind: "$decisionAuditLog" },
    {
      $match: {
        "decisionAuditLog.newStatus": newStatus,
        "decisionAuditLog.decidedAt": {
          $gte: startOfToday,
          $lt: endOfToday,
        },
      },
    },
    { $count: "count" },
  ]);

  return result?.count || 0;
};

exports.getRegistrarDashboard = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    pendingEnrollments,
    approvedEnrollments,
    rejectedEnrollments,
    correctionEnrollments,
    approvalsToday,
    rejectionsToday,
    returnsToday,
    activeAcademicSession,
    latestPendingEnrollments,
  ] = await Promise.all([
    Enrollment.countDocuments({ status: "pending" }),
    Enrollment.countDocuments({ status: "approved" }),
    Enrollment.countDocuments({ status: "rejected" }),
    Enrollment.countDocuments({ status: "correction_required" }),
    countDecisionsToday("approved", startOfToday, endOfToday),
    countDecisionsToday("rejected", startOfToday, endOfToday),
    countDecisionsToday("correction_required", startOfToday, endOfToday),
    AcademicSession.findOne({ isActive: true }).sort({ createdAt: -1 }),
    Enrollment.find({ status: "pending" })
      .populate("student", "name email studentId registrationNumber status")
      .populate("courses", "title code creditHours isActive")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const enrollmentOpen =
    activeAcademicSession?.enrollmentStatus === "open" ||
    activeAcademicSession?.registrationOpen === true;

  res.status(200).json({
    status: "success",
    data: {
      summary: {
        pendingEnrollments,
        approvedEnrollments,
        rejectedEnrollments,
        correctionEnrollments,
        approvalsToday,
        rejectionsToday,
        returnsToday,
        activeAcademicSession,
        enrollmentStatus: enrollmentOpen ? "open" : "closed",
        latestPendingEnrollments,
      },
    },
  });
};
