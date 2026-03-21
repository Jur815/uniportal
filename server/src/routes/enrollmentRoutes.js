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
router.get("/", restrictTo("admin"), ctrl.getAllEnrollments);
router.patch("/:id/status", restrictTo("admin"), ctrl.updateEnrollmentStatus);

module.exports = router;
