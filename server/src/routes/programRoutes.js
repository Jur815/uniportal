const express = require("express");
const programController = require("../controllers/programController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, programController.getAllPrograms)
  .post(protect, restrictTo("admin"), programController.createProgram);

router
  .route("/:id")
  .get(protect, programController.getProgram)
  .patch(protect, restrictTo("admin"), programController.updateProgram)
  .delete(protect, restrictTo("admin"), programController.deleteProgram);

module.exports = router;
