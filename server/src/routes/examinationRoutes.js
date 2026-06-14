const express = require("express");
const ctrl = require("../controllers/examinationController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/my-results", restrictTo("student"), ctrl.getMyReleasedResults);
router.get(
  "/policy",
  restrictTo("admin", "registrar", "lecturer", "dean_hod"),
  ctrl.getPolicy,
);
router.put("/policy", restrictTo("admin"), ctrl.upsertPolicy);
router.get(
  "/records",
  restrictTo("admin", "registrar", "lecturer", "dean_hod"),
  ctrl.getRecords,
);
router.patch(
  "/records/:id/marks",
  restrictTo("admin", "registrar", "lecturer"),
  ctrl.enterMarks,
);
router.post(
  "/records/:id/workflow",
  restrictTo("admin", "registrar", "lecturer", "dean_hod"),
  ctrl.transitionWorkflow,
);
router.get(
  "/reports",
  restrictTo("admin", "registrar", "dean_hod"),
  ctrl.getReports,
);

module.exports = router;
