const router = require("express").Router();
const { protect } = require("../middleware/protect");

router.get("/me", protect, (req, res) => {
  res.json({
    status: "success",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

module.exports = router;
