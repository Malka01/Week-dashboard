const reportService = require("../services/report.service");

const createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Report draft created successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await reportService.getMyReports(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await reportService.updateReport(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const submitReport = async (req, res) => {
  try {
    const report = await reportService.submitReport(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
};