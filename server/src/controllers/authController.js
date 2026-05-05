const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const badRequest = (res, message) =>
  res.status(400).json({ status: "fail", message });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return badRequest(res, "Name, email and password are required");
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return badRequest(res, "Name, email and password are required");
    }

    if (!validator.isEmail(normalizedEmail)) {
      return badRequest(res, "Please provide a valid email");
    }

    if (password.length < 6) {
      return badRequest(res, "Password must be at least 6 characters");
    }

    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (err) {
    // Duplicate email (Mongo)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ status: "fail", message: "Email already registered" });
    }

    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return badRequest(res, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return badRequest(res, "Email and password are required");
    }

    if (!validator.isEmail(normalizedEmail)) {
      return badRequest(res, "Please provide a valid email");
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// const User = require("../models/User");

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};
