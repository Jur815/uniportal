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
    pendingEnrollments,
    approvedEnrollments,
    activeAcademicSession,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Faculty.countDocuments(),
    Department.countDocuments(),
    Program.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: "pending" }),
    Enrollment.countDocuments({ status: "approved" }),
    AcademicSession.findOne({ isActive: true }).sort({ createdAt: -1 }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      kpis: {
        totalStudents,
        totalFaculties,
        totalDepartments,
        totalPrograms,
        totalCourses,
        pendingEnrollments,
        approvedEnrollments,
        activeAcademicSession,
      },
    },
  });
};
