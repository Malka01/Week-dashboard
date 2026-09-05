const express = require("express");

const {
  register,
  login,
  updateProfile,
  changePassword,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put(
  "/profile",
  authenticate,
  updateProfile
);

router.put(
  "/change-password",
  authenticate,
  changePassword
);

module.exports = router;