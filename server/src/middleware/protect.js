const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "You are not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res
        .status(401)
        .json({ status: "fail", message: "User no longer exists" });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid or expired token" });
  }
};
