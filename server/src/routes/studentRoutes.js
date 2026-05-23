const express = require("express");
const ctrl = require("../controllers/studentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("admin"), ctrl.createStudent);
router.get("/", restrictTo("admin", "registrar"), ctrl.getStudents);
router.get("/:id", restrictTo("admin", "registrar"), ctrl.getStudent);
router.patch("/:id/status", restrictTo("admin"), ctrl.updateStudentStatus);
router.patch(
  "/:id/academic-verification",
  restrictTo("admin"),
  ctrl.updateAcademicVerification,
);

module.exports = router;
