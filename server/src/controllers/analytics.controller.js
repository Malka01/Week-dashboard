const analyticsService = require("../services/analytics.service");

const getDashboardAnalytics = async (req, res) => {
  try {
    const {
  userId,
  projectId,
  status,
  startDate,
  endDate,
} = req.query;

    const data =
  await analyticsService.getDashboardAnalytics({
    userId,
    projectId,
    status,
    startDate,
    endDate,
  });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard analytics",
    });
  }
};

module.exports = {
  getDashboardAnalytics,
};
