const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/enrollmentController");

const router = express.Router();

router.post("/", protect, restrictTo("student"), ctrl.enroll);
router.get("/me", protect, restrictTo("student"), ctrl.getMyCourses);

module.exports = router;
