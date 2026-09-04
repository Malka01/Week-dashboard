const adminReportService = require("../services/adminReport.service");

const getAllReports = async (req, res) => {
  try {
    const {
      status,
      projectId,
      userId,
      startDate,
      endDate,
    } = req.query;

    const reports =
      await adminReportService.getAllReports({
        status,
        projectId,
        userId,
        startDate,
        endDate,
      });

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

const getReportForReview = async (req, res) => {
  try {
    const data =
      await adminReportService.getReportForReview(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const requestCorrection = async (req, res) => {
  try {
    const result =
      await adminReportService.requestCorrection(
        req.params.id,
        req.user._id,
        req.body.comment
      );

    res.status(200).json({
      success: true,
      message:
        "Correction requested successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const approveReport = async (req, res) => {
  try {
    const result =
      await adminReportService.approveReport(
        req.params.id,
        req.user._id,
        req.body.comment
      );

    res.status(200).json({
      success: true,
      message: "Report approved successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllReports,
  getReportForReview,
  requestCorrection,
  approveReport,
};