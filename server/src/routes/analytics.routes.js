const express = require("express");

const {
  getDashboardAnalytics,
} = require("../controllers/analytics.controller");

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get(
  "/dashboard",
  getDashboardAnalytics
);

module.exports = router;
