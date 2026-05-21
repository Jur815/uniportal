const express = require("express");
const ctrl = require("../controllers/academicSessionController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/active", protect, ctrl.getActiveSession);

router.use(protect);
router.use(restrictTo("admin"));

router.get("/", ctrl.getSessions);
router.post("/", ctrl.createSession);
router.patch("/:id", ctrl.updateSession);

module.exports = router;
