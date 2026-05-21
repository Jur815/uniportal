const express = require("express");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/courseController");

const router = express.Router();

router.get("/", protect, ctrl.getCourses);
router.get("/admin", protect, restrictTo("admin"), ctrl.getAdminCourses);
router.get("/admin/:id", protect, restrictTo("admin"), ctrl.getAdminCourse);
router.post("/", protect, restrictTo("admin"), ctrl.createCourse);
router.patch(
  "/:id/status",
  protect,
  restrictTo("admin"),
  ctrl.updateCourseStatus,
);
router.patch("/:id", protect, restrictTo("admin"), ctrl.updateCourse);

module.exports = router;
