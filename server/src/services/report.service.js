const Report = require("../models/Report");
const ReportVersion = require("../models/ReportVersion");
const Review = require("../models/Review");


const createReport = async (userId, reportData) => {
  const {
    weekStart,
    weekEnd,
    projectId,
    tasks,
    nextWeekTasks,
    blockers,
    achievements,
    hours,
    notes,
  } = reportData;

  const existingReport = await Report.findOne({
    userId,
    weekStart,
    projectId,
  });

  if (existingReport) {
    throw new Error(
      "You already have a report for this week and project"
    );
  }

  const report = await Report.create({
    userId,
    weekStart,
    weekEnd,
    projectId,
    tasks,
    nextWeekTasks,
    blockers,
    achievements,
    hours,
    notes,
    status: "DRAFT",
  });

  return report;
};

const getMyReports = async (userId) => {
  return Report.find({ userId })
    .populate("projectId", "name description")
    .sort({ weekStart: -1 });
};

// const getReportById = async (reportId, userId) => {
//   const report = await Report.findOne({
//     _id: reportId,
//     userId,
//   }).populate("projectId", "name description");

//   if (!report) {
//     throw new Error("Report not found");
//   }

//   return report;
// };

const getReportById = async (reportId, userId) => {
  const report = await Report.findOne({
    _id: reportId,
    userId,
  }).populate(
    "projectId",
    "name description"
  );

  if (!report) {
    throw new Error("Report not found");
  }

  const reviews = await Review.find({
    reportId: report._id,
  })
    .populate(
      "reviewerId",
      "name email role"
    )
    .sort({
      createdAt: -1,
    });

  const versions = await ReportVersion.find({
    reportId: report._id,
  })
    .populate(
      "submittedBy",
      "name email"
    )
    .sort({
      version: -1,
    });

  return {
    report,
    reviews,
    versions,
  };
};

const updateReport = async (
  reportId,
  userId,
  reportData
) => {
  const report = await Report.findOne({
    _id: reportId,
    userId,
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (
    !["DRAFT", "NEEDS_CORRECTION"].includes(
      report.status
    )
  ) {
    throw new Error(
      "Only Draft or Needs Correction reports can be edited"
    );
  }

  const allowedFields = [
    "weekStart",
    "weekEnd",
    "projectId",
    "tasks",
    "nextWeekTasks",
    "blockers",
    "achievements",
    "hours",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (reportData[field] !== undefined) {
      report[field] = reportData[field];
    }
  });

  await report.save();

  return report;
};

// const submitReport = async (reportId, userId) => {
//   const report = await Report.findOne({
//     _id: reportId,
//     userId,
//   });

//   if (!report) {
//     throw new Error("Report not found");
//   }

//   if (
//     !["DRAFT", "NEEDS_CORRECTION"].includes(
//       report.status
//     )
//   ) {
//     throw new Error(
//       "Only Draft or Needs Correction reports can be submitted"
//     );
//   }

//   report.status = "SUBMITTED";

//   await report.save();

//   return report;
// };

const submitReport = async (reportId, userId) => {
  const report = await Report.findOne({
    _id: reportId,
    userId,
  });

  if (!report) {
    throw new Error("Report not found");
  }

  if (
    !["DRAFT", "NEEDS_CORRECTION"].includes(
      report.status
    )
  ) {
    throw new Error(
      "Only Draft or Needs Correction reports can be submitted"
    );
  }

  const previousVersion =
    await ReportVersion.findOne({
      reportId: report._id,
    }).sort({
      version: -1,
    });

  const nextVersion = previousVersion
    ? previousVersion.version + 1
    : 1;

  const version = await ReportVersion.create({
    reportId: report._id,
    version: nextVersion,
    content: report.toObject(),
    submittedAt: new Date(),
    submittedBy: userId,
  });

  const reviewAction =
    report.status === "NEEDS_CORRECTION"
      ? "RESUBMITTED"
      : "SUBMITTED";

  report.status = "SUBMITTED";

  await report.save();

  await Review.create({
    reportId: report._id,
    versionId: version._id,
    reviewerId: userId,
    action: reviewAction,
    comment: "",
  });

  return report;
};


module.exports = {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  submitReport,
};