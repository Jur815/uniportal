const express = require("express");
const ctrl = require("../controllers/timetableController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my", restrictTo("student"), ctrl.getMyTimetable);
router.post("/", restrictTo("admin", "registrar"), ctrl.createEntry);
router.get("/", restrictTo("admin", "registrar"), ctrl.getEntries);
router.patch("/:id", restrictTo("admin", "registrar"), ctrl.updateEntry);
router.delete("/:id", restrictTo("admin", "registrar"), ctrl.deleteEntry);

module.exports = router;
