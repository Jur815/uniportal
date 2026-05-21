const express = require("express");
const ctrl = require("../controllers/adminDashboardController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin", "registrar"));

router.get("/dashboard", ctrl.getAdminKpis);

module.exports = router;
