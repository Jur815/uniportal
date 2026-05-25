const express = require("express");
const profileController = require("../controllers/profileController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("student"));

router.get("/me", profileController.getMyProfile);
router.patch("/me", profileController.updateMyProfile);

module.exports = router;
