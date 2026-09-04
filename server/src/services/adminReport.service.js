const Report = require("../models/Report");
const Review = require("../models/Review");
const ReportVersion = require("../models/ReportVersion");

const getAllReports = async ({
  status,
  projectId,
  userId,
  startDate,
  endDate,
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (projectId) {
    filter.projectId = projectId;
  }

  if (userId) {
    filter.userId = userId;
  }

  if (startDate || endDate) {
    filter.weekStart = {};

    if (startDate) {
      filter.weekStart.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.weekStart.$lte = new Date(endDate);
    }
  }

  return Report.find(filter)
    .populate("userId", "name email role")
    .populate("projectId", "name description")
    .sort({ weekStart: -1, updatedAt: -1 });
};

const getReportForReview = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("userId", "name email role")
    .populate("projectId", "name description");

  if (!report) {
    throw new Error("Report not found");
  }

  const reviews = await Review.find({
    reportId,
  })
    .populate("reviewerId", "name email role")
    .sort({ createdAt: -1 });

  const versions = await ReportVersion.find({
    reportId,
  })
    .populate("submittedBy", "name email")
    .sort({ version: -1 });

  return {
    report,
    reviews,
    versions,
  };
};

const requestCorrection = async (
  reportId,
  reviewerId,
  comment
) => {
  if (!comment || !comment.trim()) {
    throw new Error(
      "A correction comment is required"
    );
  }

  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "SUBMITTED") {
    throw new Error(
      "Only submitted reports can be sent for correction"
    );
  }

  report.status = "NEEDS_CORRECTION";

  await report.save();

  const review = await Review.create({
    reportId: report._id,
    reviewerId,
    action: "REQUESTED_CORRECTION",
    comment: comment.trim(),
  });

  return {
    report,
    review,
  };
};

const approveReport = async (
  reportId,
  reviewerId,
  comment
) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "SUBMITTED") {
    throw new Error(
      "Only submitted reports can be approved"
    );
  }

  report.status = "APPROVED";

  await report.save();

  const review = await Review.create({
    reportId: report._id,
    reviewerId,
    action: "APPROVED",
    comment: comment?.trim() || "",
  });

  return {
    report,
    review,
  };
};

module.exports = {
  getAllReports,
  getReportForReview,
  requestCorrection,
  approveReport,
};