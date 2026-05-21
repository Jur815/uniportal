const express = require("express");
const facultyController = require("../controllers/facultyController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, facultyController.getAllFaculties)
  .post(protect, restrictTo("admin"), facultyController.createFaculty);

router
  .route("/:id")
  .get(protect, facultyController.getFaculty)
  .patch(protect, restrictTo("admin"), facultyController.updateFaculty)
  .delete(protect, restrictTo("admin"), facultyController.deleteFaculty);

module.exports = router;
