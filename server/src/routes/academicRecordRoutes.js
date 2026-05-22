const express = require("express");
const ctrl = require("../controllers/academicRecordController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my", restrictTo("student"), ctrl.getMyRecords);

router.get("/", restrictTo("admin", "registrar"), ctrl.getRecords);
router.post(
  "/from-enrollment",
  restrictTo("admin", "registrar"),
  ctrl.generateFromEnrollment,
);
router.patch(
  "/:id/grades",
  restrictTo("admin", "registrar"),
  ctrl.updateRecordGrades,
);

module.exports = router;
