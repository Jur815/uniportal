const express = require("express");
const departmentController = require("../controllers/departmentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, departmentController.getAllDepartments)
  .post(protect, restrictTo("admin"), departmentController.createDepartment);

router
  .route("/:id")
  .get(protect, departmentController.getDepartment)
  .patch(protect, restrictTo("admin"), departmentController.updateDepartment)
  .delete(protect, restrictTo("admin"), departmentController.deleteDepartment);

module.exports = router;
