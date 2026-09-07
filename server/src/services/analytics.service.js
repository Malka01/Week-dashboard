const mongoose = require("mongoose");
const Report = require("../models/Report");
const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");

const getDashboardAnalytics = async ({
  userId,
  projectId,
  status,
  startDate,
  endDate,
} = {}) => {
  /*
   * --------------------------------------------------
   * REPORT FILTER
   * --------------------------------------------------
   */

  const reportFilter = {};

  if (userId) {
    reportFilter.userId = new mongoose.Types.ObjectId(userId);
  }

  if (projectId) {
    reportFilter.projectId = new mongoose.Types.ObjectId(projectId);
  }

  if (status) {
    reportFilter.status = status;
  } else {
    // Dashboard normally excludes drafts from analytics
    reportFilter.status = {
      $ne: "DRAFT",
    };
  }

  /*
   * Date filtering
   */

  if (startDate || endDate) {
    reportFilter.weekStart = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      reportFilter.weekStart.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      reportFilter.weekStart.$lte = end;
    }
  }

  /*
   * --------------------------------------------------
   * SUMMARY
   * --------------------------------------------------
   */

  const [
    totalReports,
    submittedReports,
    approvedReports,
    correctionReports,
    draftReports,
  ] = await Promise.all([
    Report.countDocuments(reportFilter),

    Report.countDocuments({
      ...reportFilter,
      status: "SUBMITTED",
    }),

    Report.countDocuments({
      ...reportFilter,
      status: "APPROVED",
    }),

    Report.countDocuments({
      ...reportFilter,
      status: "NEEDS_CORRECTION",
    }),

    // Drafts must use a separate filter because
    // reportFilter normally excludes drafts.
    Report.countDocuments({
      ...Object.fromEntries(
        Object.entries(reportFilter).filter(
          ([key]) => key !== "status"
        )
      ),
      status: "DRAFT",
    }),
  ]);

  /*
   * --------------------------------------------------
   * WEEKLY COMPLIANCE
   * --------------------------------------------------
   *
   * We compare active TEAM_MEMBER users against
   * their reports.
   *
   * This allows us to detect:
   *
   * SUBMITTED
   * APPROVED
   * NEEDS_CORRECTION
   * PENDING / DRAFT
   * NOT_STARTED
   * LATE
   */

  const today = new Date();

  const day = today.getDay();

  const diffToMonday =
    day === 0 ? -6 : 1 - day;

  const currentWeekStart = new Date(today);

  currentWeekStart.setHours(0, 0, 0, 0);

  currentWeekStart.setDate(
    today.getDate() + diffToMonday
  );

  const currentWeekEnd = new Date(
    currentWeekStart
  );

  currentWeekEnd.setDate(
    currentWeekStart.getDate() + 6
  );

  currentWeekEnd.setHours(
    23,
    59,
    59,
    999
  );

  /*
   * Determine which week should be used.
   *
   * If date filters exist, use the selected
   * date range. Otherwise use current week.
   */

  const complianceWeekStart = startDate
    ? new Date(startDate)
    : currentWeekStart;

  complianceWeekStart.setHours(0, 0, 0, 0);

  const complianceWeekEnd = endDate
    ? new Date(endDate)
    : currentWeekEnd;

  complianceWeekEnd.setHours(
    23,
    59,
    59,
    999
  );

  /*
   * Active team members
   */

  const userFilter = {
    role: "TEAM_MEMBER",
    isActive: true,
  };

  if (userId) {
    userFilter._id = new mongoose.Types.ObjectId(userId);
  }

  const teamMembers = await User.find(
    userFilter
  ).select("_id name email");

  /*
   * Reports for selected compliance week
   */

  const complianceReports = await Report.find({
    userId: {
      $in: teamMembers.map(
        (member) => member._id
      ),
    },

    weekStart: {
      $gte: complianceWeekStart,
      $lte: complianceWeekEnd,
    },

    ...(projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId) }
      : {}),
  })
    .populate("projectId", "name")
    .sort({
      updatedAt: -1,
    });

  /*
   * Create member compliance records
   */

  const teamCompliance = teamMembers.map(
    (member) => {
      const memberReports =
        complianceReports.filter(
          (report) =>
            report.userId.toString() ===
            member._id.toString()
        );

      /*
       * A user may have multiple reports if
       * reports are project-specific.
       *
       * Select the most recently updated report
       * for the compliance status.
       */

      const report =
        memberReports.length > 0
          ? memberReports[0]
          : null;

      let complianceStatus =
        "NOT_STARTED";

      if (report) {
        if (report.status === "APPROVED") {
          complianceStatus = "APPROVED";
        } else if (
          report.status === "SUBMITTED"
        ) {
          complianceStatus = "SUBMITTED";
        } else if (
          report.status ===
          "NEEDS_CORRECTION"
        ) {
          complianceStatus =
            "NEEDS_CORRECTION";
        } else if (
          report.status === "DRAFT"
        ) {
          complianceStatus = "PENDING";
        }
      }

      /*
       * Late definition:
       *
       * If the reporting week has ended and
       * the member has not submitted/approved
       * a report, mark as late.
       */

      const weekHasEnded =
        new Date() > complianceWeekEnd;

      const isComplete =
        complianceStatus === "SUBMITTED" ||
        complianceStatus === "APPROVED";

      const isLate =
        weekHasEnded &&
        !isComplete;

      if (isLate) {
        complianceStatus = "LATE";
      }

      return {
        memberId: member._id,
        name: member.name,
        email: member.email,

        status: complianceStatus,

        reportId:
          report?._id || null,

        projectId:
          report?.projectId?._id || null,

        projectName:
          report?.projectId?.name || null,

        reportStatus:
          report?.status || null,

        weekStart:
          report?.weekStart ||
          complianceWeekStart,

        weekEnd:
          report?.weekEnd ||
          complianceWeekEnd,

        updatedAt:
          report?.updatedAt || null,

        hasReport:
          Boolean(report),
      };
    }
  );

  /*
   * Compliance counters
   */

  const submittedThisWeek =
    teamCompliance.filter(
      (member) =>
        member.status === "SUBMITTED"
    ).length;

  const approvedThisWeek =
    teamCompliance.filter(
      (member) =>
        member.status === "APPROVED"
    ).length;

  const pending =
    teamCompliance.filter(
      (member) =>
        member.status === "PENDING"
    ).length;

  const notStarted =
    teamCompliance.filter(
      (member) =>
        member.status === "NOT_STARTED"
    ).length;

  const late =
    teamCompliance.filter(
      (member) =>
        member.status === "LATE"
    ).length;

  const needsCorrection =
    teamCompliance.filter(
      (member) =>
        member.status ===
        "NEEDS_CORRECTION"
    ).length;

  /*
   * Compliance percentage:
   *
   * Submitted OR Approved = compliant
   */

  const compliant =
    submittedThisWeek +
    approvedThisWeek;

  const totalTeamMembers =
    teamCompliance.length;

  const compliancePercentage =
    totalTeamMembers > 0
      ? Math.round(
          (compliant /
            totalTeamMembers) *
            100
        )
      : 0;

  /*
   * --------------------------------------------------
   * STATUS DISTRIBUTION
   * --------------------------------------------------
   */

  const statusDistribution =
    await Report.aggregate([
      {
        $match: reportFilter,
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * REPORTS BY MEMBER
   * --------------------------------------------------
   */

  const reportsByMember =
    await Report.aggregate([
      {
        $match: reportFilter,
      },
      {
        $group: {
          _id: "$userId",

          total: {
            $sum: 1,
          },

          approved: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "APPROVED",
                  ],
                },
                1,
                0,
              ],
            },
          },

          submitted: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "SUBMITTED",
                  ],
                },
                1,
                0,
              ],
            },
          },

          correction: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "NEEDS_CORRECTION",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          total: 1,
          approved: 1,
          submitted: 1,
          correction: 1,
        },
      },

      {
        $sort: {
          total: -1,
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * WORKLOAD BY PROJECT
   * --------------------------------------------------
   */

  const workloadByProject =
    await Report.aggregate([
      {
        $match: reportFilter,
      },

      {
        $group: {
          _id: "$projectId",

          reports: {
            $sum: 1,
          },

          totalTimeSpent: {
            $sum: {
              $reduce: {
                input: "$tasks",
                initialValue: 0,

                in: {
                  $add: [
                    "$$value",
                    {
                      $ifNull: [
                        "$$this.timeSpent",
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },

      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },

      {
        $unwind: {
          path: "$project",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,

          name: {
            $ifNull: [
              "$project.name",
              "Unknown Project",
            ],
          },

          reports: 1,
          totalTimeSpent: 1,
        },
      },

      {
        $sort: {
          totalTimeSpent: -1,
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * TASK COMPLETION
   * --------------------------------------------------
   */

  const taskCompletion =
    await Report.aggregate([
      {
        $match: reportFilter,
      },

      {
        $unwind: "$tasks",
      },

      {
        $group: {
          _id: null,

          planned: {
            $avg: {
              $ifNull: [
                "$tasks.plannedPercentage",
                0,
              ],
            },
          },

          actual: {
            $avg: {
              $ifNull: [
                "$tasks.actualPercentage",
                0,
              ],
            },
          },
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * TIME BY TASK TYPE
   * --------------------------------------------------
   */

  const timeByTaskType =
    await Report.aggregate([
      {
        $match: reportFilter,
      },

      {
        $group: {
          _id: null,

          development: {
            $sum: {
              $ifNull: [
                "$hours.development",
                0,
              ],
            },
          },

          testing: {
            $sum: {
              $ifNull: [
                "$hours.testing",
                0,
              ],
            },
          },

          meetings: {
            $sum: {
              $ifNull: [
                "$hours.meetings",
                0,
              ],
            },
          },

          research: {
            $sum: {
              $ifNull: [
                "$hours.research",
                0,
              ],
            },
          },

          other: {
            $sum: {
              $ifNull: [
                "$hours.other",
                0,
              ],
            },
          },
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * OPEN BLOCKERS
   * --------------------------------------------------
   */

  const blockerReports =
    await Report.find({
      ...reportFilter,

      "blockers.description": {
        $exists: true,
        $nin: ["", null],
      },
    })
      .populate("userId", "name email")
      .populate("projectId", "name")
      .select(
        "userId projectId weekStart blockers"
      )
      .sort({
        weekStart: -1,
      })
      .limit(10);

  /*
   * Flatten blockers so frontend doesn't need
   * to understand the nested array structure.
   */

  const reportsWithBlockers =
    blockerReports.flatMap(
      (report) =>
        report.blockers
          .filter(
            (blocker) =>
              blocker.description
          )
          .map((blocker) => ({
            _id: `${report._id}-${blocker._id}`,

            reportId: report._id,

            userId: report.userId,

            projectId:
              report.projectId,

            weekStart:
              report.weekStart,

            blocker: {
              description:
                blocker.description,

              isKeyIssue:
                blocker.isKeyIssue,
            },
          }))
    );

  /*
   * --------------------------------------------------
   * TASK COMPLETION TREND
   * --------------------------------------------------
   */

  const taskCompletionTrend =
    await Report.aggregate([
      {
        $match: reportFilter,
      },

      {
        $unwind: "$tasks",
      },

      {
        $group: {
          _id: "$weekStart",

          planned: {
            $avg: {
              $ifNull: [
                "$tasks.plannedPercentage",
                0,
              ],
            },
          },

          actual: {
            $avg: {
              $ifNull: [
                "$tasks.actualPercentage",
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

  /*
   * --------------------------------------------------
   * RECENT ACTIVITY
   * --------------------------------------------------
   */

  const activityReportIds =
    await Report.find(
      reportFilter
    ).distinct("_id");

  const recentActivity =
    await Review.find({
      reportId: {
        $in: activityReportIds,
      },
    })
      .populate(
        "reviewerId",
        "name email role"
      )
      .populate({
        path: "reportId",

        populate: [
          {
            path: "userId",
            select: "name email",
          },

          {
            path: "projectId",
            select: "name",
          },
        ],
      })
      .sort({
        createdAt: -1,
      })
      .limit(10);

  /*
   * --------------------------------------------------
   * RETURN
   * --------------------------------------------------
   */

  return {
    summary: {
      totalReports,

      submittedReports,

      approvedReports,

      correctionReports,

      draftReports,

      /*
       * Phase 3 compliance metrics
       */

      submittedThisWeek,

      approvedThisWeek,

      pending,

      notStarted,

      late,

      needsCorrection,

      totalTeamMembers,

      compliancePercentage,
    },

    /*
     * Team compliance table
     */

    teamCompliance,

    statusDistribution,

    reportsByMember,

    workloadByProject,

    taskCompletion:
      taskCompletion[0] || {
        planned: 0,
        actual: 0,
      },

    timeByTaskType:
      timeByTaskType[0] || {
        development: 0,
        testing: 0,
        meetings: 0,
        research: 0,
        other: 0,
      },

    taskCompletionTrend,

    reportsWithBlockers,

    recentActivity,
  };
};

module.exports = {
  getDashboardAnalytics,
};