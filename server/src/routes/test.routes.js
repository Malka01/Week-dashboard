const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/team",
  authenticate,
  authorizeRoles("TEAM_MEMBER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Team Member",
      user: req.user.name,
    });
  }
);

router.get(
  "/admin",
  authenticate,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
      user: req.user.name,
    });
  }
);

module.exports = router;