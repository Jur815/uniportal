const express = require("express");
const ctrl = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔐 Protect all routes
router.use(protect);

// 🎓 Student routes
router.post("/", restrictTo("student"), ctrl.enroll);
router.get("/my", restrictTo("student"), ctrl.getMyCourses);

// 🛠️ Admin routes
router.get("/", restrictTo("admin", "registrar"), ctrl.getAllEnrollments);
router.get("/:id", restrictTo("admin", "registrar"), ctrl.getEnrollment);
router.patch(
  "/:id/status",
  restrictTo("admin", "registrar"),
  ctrl.updateEnrollmentStatus,
);

module.exports = router;
