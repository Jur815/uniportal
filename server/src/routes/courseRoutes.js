const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/courseController");

const router = express.Router();

router.get("/", protect, ctrl.getCourses);
router.post("/", protect, restrictTo("admin"), ctrl.createCourse);

module.exports = router;
