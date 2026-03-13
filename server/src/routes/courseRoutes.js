const express = require("express");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/courseController");

const router = express.Router();

router.get("/", protect, ctrl.getCourses);
router.post("/", protect, restrictTo("admin"), ctrl.createCourse);

module.exports = router;
