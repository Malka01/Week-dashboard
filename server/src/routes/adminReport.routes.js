const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAllReports,
  getReportForReview,
  requestCorrection,
  approveReport,
} = require("../controllers/adminReport.controller");

const router = express.Router();

router.use(authenticate);

router.use(
  authorizeRoles("ADMIN")
);

// Get all reports
router.get("/", getAllReports);

// Get one report for review
router.get("/:id", getReportForReview);

// Request correction
router.post("/:id/request-correction", requestCorrection);

// Approve report
router.post("/:id/approve", approveReport);

module.exports = router;