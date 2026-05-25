const express = require("express");
const ctrl = require("../controllers/complaintController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("student"), ctrl.createComplaint);
router.get("/my", restrictTo("student"), ctrl.getMyComplaints);
router.get("/", restrictTo("admin", "registrar"), ctrl.getComplaints);
router.patch("/:id", restrictTo("admin", "registrar"), ctrl.updateComplaint);

module.exports = router;
