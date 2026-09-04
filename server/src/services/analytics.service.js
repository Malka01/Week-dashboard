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
    const reportFilter = {};
    if (userId) {
        reportFilter.userId = userId;
    }

    if (projectId) {
        reportFilter.projectId = projectId;
    }

    if (status) {
        reportFilter.status = status;
    }

    // Optional date filtering
    if (startDate || endDate) {
        reportFilter.weekStart = {};

        if (startDate) {
            reportFilter.weekStart.$gte = new Date(
                startDate
            );
        }

        if (endDate) {
            reportFilter.weekStart.$lte = new Date(
                endDate
            );
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

        Report.countDocuments({
            ...reportFilter,
            status: "DRAFT",
        }),
    ]);

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

    const reportsWithBlockers =
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

    const recentActivity =
        await Review.find({})
            .populate("reviewerId", "name email")
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
        },

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