const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/studentProfileController");

const router = express.Router();

router.get("/me", protect, restrictTo("student"), ctrl.getMyProfile);
router.post(
  "/me",
  protect,
  restrictTo("student"),
  ctrl.createOrUpdateMyProfile,
);

module.exports = router;
