const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
} = require("../controllers/report.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", createReport);

router.get("/my-reports", getMyReports);

router.get("/:id", getReportById);

router.put("/:id", updateReport);

router.post("/:id/submit", submitReport);

module.exports = router;