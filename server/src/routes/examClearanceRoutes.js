const express = require("express");
const ctrl = require("../controllers/examClearanceController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my", restrictTo("student"), ctrl.getMyClearances);
router.post("/", restrictTo("admin", "registrar"), ctrl.createClearance);
router.get("/", restrictTo("admin", "registrar"), ctrl.getClearances);
router.patch("/:id", restrictTo("admin", "registrar"), ctrl.updateClearance);

module.exports = router;
