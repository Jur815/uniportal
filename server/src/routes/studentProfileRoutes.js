const express = require("express");
const profileController = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", profileController.getMyProfile);
router.patch("/me", profileController.updateMyProfile);

module.exports = router;
