const Department = require("../models/departmentModel");

exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const filter = {};

    if (req.query.faculty) {
      filter.faculty = req.query.faculty;
    }

    const departments = await Department.find(filter)
      .populate("faculty", "name code")
      .sort("name");

    res.status(200).json({
      status: "success",
      results: departments.length,
      data: { departments },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "faculty",
      "name code",
    );

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("faculty", "name code");

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { department },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "Department not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
