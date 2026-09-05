require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");
const ReportVersion = require("../models/ReportVersion");
const Review = require("../models/Review");

const MONGODB_URI = process.env.MONGODB_URI;

const usersData = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "Member123!",
    role: "TEAM_MEMBER",
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "Member123!",
    role: "TEAM_MEMBER",
  },
  {
    name: "David Brown",
    email: "david@example.com",
    password: "Member123!",
    role: "TEAM_MEMBER",
  },
  {
    name: "Emma Davis",
    email: "emma@example.com",
    password: "Member123!",
    role: "TEAM_MEMBER",
  },
];

const projectsData = [
  {
    name: "CRM System",
    description: "Customer relationship management platform",
  },
  {
    name: "Internal Tooling",
    description: "Internal productivity and automation tools",
  },
  {
    name: "Mobile Application",
    description: "Customer-facing mobile application",
  },
  {
    name: "R&D Platform",
    description: "Research and development initiatives",
  },
  {
    name: "Marketing Website",
    description: "Company marketing and landing website",
  },
];

const getDate = (dateString) => new Date(dateString);

const createTask = ({
  taskName,
  priority = "MEDIUM",
  plannedPercentage = 100,
  actualPercentage = 100,
  status = "COMPLETED",
  timePlanned = 8,
  timeSpent = 8,
  output = "",
}) => ({
  taskName,
  priority,
  plannedPercentage,
  actualPercentage,
  status,
  timePlanned,
  timeSpent,
  output,
});

const createReportData = ({
  userId,
  projectId,
  weekStart,
  weekEnd,
  status,
  tasks,
  nextWeekTasks,
  blockers = [],
  achievements = [],
  hours,
  notes,
}) => ({
  userId,
  projectId,
  weekStart: getDate(weekStart),
  weekEnd: getDate(weekEnd),
  status,
  tasks,
  nextWeekTasks,
  blockers,
  achievements,
  hours,
  notes,
});

const seedData = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables."
      );
    }

    await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB");

    /*
     * ----------------------------------------------------
     * 1. ADMIN
     * ----------------------------------------------------
     */

    let admin = await User.findOne({
      email: "admin@example.com",
    }).select("+password");

    if (!admin) {
      const hashedPassword = await bcrypt.hash(
        "Admin123!",
        12
      );

      admin = await User.create({
        name: "Admin Manager",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });

      console.log("Admin created");
    } else {
      console.log("Admin already exists");
    }

    /*
     * ----------------------------------------------------
     * 2. TEAM MEMBERS
     * ----------------------------------------------------
     */

    const teamMembers = [];

    for (const userData of usersData) {
      let user = await User.findOne({
        email: userData.email,
      }).select("+password");

      if (!user) {
        const hashedPassword = await bcrypt.hash(
          userData.password,
          12
        );

        user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
        });

        console.log(
          `Created team member: ${userData.name}`
        );
      } else {
        console.log(
          `Team member already exists: ${userData.name}`
        );
      }

      teamMembers.push(user);
    }

    /*
     * ----------------------------------------------------
     * 3. PROJECTS
     * ----------------------------------------------------
     */

    const projects = [];

    for (const projectData of projectsData) {
      let project = await Project.findOne({
        name: projectData.name,
      });

      if (!project) {
        project = await Project.create({
          name: projectData.name,
          description: projectData.description,
          isActive: true,
          assignedMembers: teamMembers.map(
            (member) => member._id
          ),
        });

        console.log(
          `Created project: ${projectData.name}`
        );
      } else {
        /*
         * Make sure all seeded team members
         * are assigned to the project.
         */
        project.assignedMembers = teamMembers.map(
          (member) => member._id
        );

        project.isActive = true;

        await project.save();

        console.log(
          `Project already exists: ${projectData.name}`
        );
      }

      projects.push(project);
    }

    /*
     * ----------------------------------------------------
     * Helper for finding projects
     * ----------------------------------------------------
     */

    const getProject = (name) => {
      return projects.find(
        (project) => project.name === name
      );
    };

    /*
     * ----------------------------------------------------
     * 4. REPORT DATA
     * ----------------------------------------------------
     *
     * Several weeks and different statuses.
     * Current week:
     * 2026-08-31 → 2026-09-06
     */

    const john = teamMembers[0];
    const sarah = teamMembers[1];
    const david = teamMembers[2];
    const emma = teamMembers[3];

    const crm = getProject("CRM System");
    const tooling = getProject("Internal Tooling");
    const mobile = getProject("Mobile Application");
    const rnd = getProject("R&D Platform");
    const marketing = getProject("Marketing Website");

    const reportDefinitions = [
      /*
       * JOHN
       * ------------------------------------------------
       */

      {
        userId: john._id,
        projectId: crm._id,
        weekStart: "2026-08-17",
        weekEnd: "2026-08-23",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Implement customer search API",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 8,
            timeSpent: 7,
            output: "Customer search REST API completed",
          }),
          createTask({
            taskName: "Add customer filters",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 6,
            timeSpent: 6,
            output: "Advanced filtering implemented",
          }),
        ],

        nextWeekTasks: [
          "Implement customer export",
          "Add API integration tests",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed customer search functionality",
            isKeyAchievement: true,
          },
          {
            description:
              "Reduced API response time by approximately 20%",
            isKeyAchievement: false,
          },
        ],

        hours: {
          development: 28,
          testing: 8,
          meetings: 4,
          research: 2,
          other: 2,
        },

        notes: "Completed CRM search module.",
      },

      {
        userId: john._id,
        projectId: crm._id,
        weekStart: "2026-08-24",
        weekEnd: "2026-08-30",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Customer export API",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 10,
            timeSpent: 9,
            output: "CSV export endpoint",
          }),
          createTask({
            taskName: "Integration testing",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 90,
            timePlanned: 8,
            timeSpent: 7,
            output: "Integration test suite",
          }),
        ],

        nextWeekTasks: [
          "Improve dashboard performance",
          "Review API documentation",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Delivered customer export feature",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 30,
          testing: 8,
          meetings: 4,
          research: 2,
          other: 1,
        },

        notes: "Export feature delivered successfully.",
      },

      {
        userId: john._id,
        projectId: crm._id,
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        status: "SUBMITTED",

        tasks: [
          createTask({
            taskName: "CRM dashboard improvements",
            priority: "HIGH",
            plannedPercentage: 70,
            actualPercentage: 65,
            status: "IN_PROGRESS",
            timePlanned: 12,
            timeSpent: 10,
            output: "Dashboard KPI components",
          }),
          createTask({
            taskName: "Performance optimization",
            priority: "MEDIUM",
            plannedPercentage: 50,
            actualPercentage: 40,
            status: "IN_PROGRESS",
            timePlanned: 8,
            timeSpent: 5,
            output: "Initial performance profiling",
          }),
        ],

        nextWeekTasks: [
          "Complete dashboard optimization",
          "Add automated dashboard tests",
        ],

        blockers: [
          {
            description:
              "Waiting for updated production API performance metrics.",
            isKeyIssue: true,
          },
        ],

        achievements: [
          {
            description:
              "Completed first phase of dashboard redesign.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 25,
          testing: 5,
          meetings: 5,
          research: 4,
          other: 1,
        },

        notes: "Dashboard optimization is currently in progress.",
      },

      /*
       * SARAH
       * ------------------------------------------------
       */

      {
        userId: sarah._id,
        projectId: tooling._id,
        weekStart: "2026-08-17",
        weekEnd: "2026-08-23",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Build internal notification service",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 12,
            timeSpent: 11,
            output: "Notification service",
          }),
          createTask({
            taskName: "Add email templates",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 6,
            timeSpent: 5,
            output: "Reusable email templates",
          }),
        ],

        nextWeekTasks: [
          "Add notification preferences",
          "Improve email delivery logging",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Delivered notification service MVP.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 30,
          testing: 7,
          meetings: 4,
          research: 2,
          other: 1,
        },

        notes: "Notification service MVP completed.",
      },

      {
        userId: sarah._id,
        projectId: tooling._id,
        weekStart: "2026-08-24",
        weekEnd: "2026-08-30",
        status: "NEEDS_CORRECTION",

        tasks: [
          createTask({
            taskName: "Notification preference UI",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 75,
            status: "IN_PROGRESS",
            timePlanned: 12,
            timeSpent: 10,
            output: "Notification settings page",
          }),
          createTask({
            taskName: "Notification delivery tests",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 60,
            status: "IN_PROGRESS",
            timePlanned: 8,
            timeSpent: 5,
            output: "Partial test coverage",
          }),
        ],

        nextWeekTasks: [
          "Complete notification testing",
          "Add error monitoring",
        ],

        blockers: [
          {
            description:
              "Email delivery failures need further investigation.",
            isKeyIssue: true,
          },
        ],

        achievements: [
          {
            description:
              "Completed notification settings UI.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 26,
          testing: 5,
          meetings: 4,
          research: 3,
          other: 1,
        },

        notes:
          "Report requires more detail about testing work.",
      },

      {
        userId: sarah._id,
        projectId: tooling._id,
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        status: "SUBMITTED",

        tasks: [
          createTask({
            taskName: "Notification error monitoring",
            priority: "HIGH",
            plannedPercentage: 80,
            actualPercentage: 70,
            status: "IN_PROGRESS",
            timePlanned: 12,
            timeSpent: 9,
            output: "Monitoring dashboard",
          }),
          createTask({
            taskName: "Email delivery retry logic",
            priority: "HIGH",
            plannedPercentage: 60,
            actualPercentage: 50,
            status: "IN_PROGRESS",
            timePlanned: 10,
            timeSpent: 7,
            output: "Retry mechanism",
          }),
        ],

        nextWeekTasks: [
          "Complete retry logic",
          "Add delivery failure alerts",
        ],

        blockers: [
          {
            description:
              "Third-party email service has intermittent delays.",
            isKeyIssue: true,
          },
        ],

        achievements: [
          {
            description:
              "Implemented notification monitoring dashboard.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 26,
          testing: 7,
          meetings: 4,
          research: 3,
          other: 1,
        },

        notes: "Monitoring improvements are progressing.",
      },

      /*
       * DAVID
       * ------------------------------------------------
       */

      {
        userId: david._id,
        projectId: mobile._id,
        weekStart: "2026-08-17",
        weekEnd: "2026-08-23",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Mobile login screen",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 10,
            timeSpent: 9,
            output: "Login UI completed",
          }),
          createTask({
            taskName: "Authentication API integration",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 10,
            timeSpent: 10,
            output: "Auth API integration",
          }),
        ],

        nextWeekTasks: [
          "Implement forgot password",
          "Add authentication tests",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed mobile authentication flow.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 30,
          testing: 6,
          meetings: 4,
          research: 2,
          other: 1,
        },

        notes: "Authentication flow completed.",
      },

      {
        userId: david._id,
        projectId: mobile._id,
        weekStart: "2026-08-24",
        weekEnd: "2026-08-30",
        status: "DRAFT",

        tasks: [
          createTask({
            taskName: "Forgot password UI",
            priority: "MEDIUM",
            plannedPercentage: 70,
            actualPercentage: 40,
            status: "IN_PROGRESS",
            timePlanned: 8,
            timeSpent: 4,
            output: "Initial forgot password screen",
          }),
        ],

        nextWeekTasks: [
          "Complete forgot password flow",
          "Add password reset validation",
        ],

        blockers: [],

        achievements: [],

        hours: {
          development: 10,
          testing: 2,
          meetings: 2,
          research: 1,
          other: 0,
        },

        notes: "Draft report - still being completed.",
      },

      {
        userId: david._id,
        projectId: mobile._id,
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        status: "SUBMITTED",

        tasks: [
          createTask({
            taskName: "Password reset flow",
            priority: "HIGH",
            plannedPercentage: 80,
            actualPercentage: 75,
            status: "IN_PROGRESS",
            timePlanned: 12,
            timeSpent: 10,
            output: "Password reset workflow",
          }),
          createTask({
            taskName: "Mobile authentication testing",
            priority: "MEDIUM",
            plannedPercentage: 60,
            actualPercentage: 50,
            status: "IN_PROGRESS",
            timePlanned: 8,
            timeSpent: 5,
            output: "Authentication test cases",
          }),
        ],

        nextWeekTasks: [
          "Complete authentication testing",
          "Prepare release candidate",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed the password reset backend integration.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 27,
          testing: 7,
          meetings: 4,
          research: 2,
          other: 1,
        },

        notes: "Mobile authentication improvements are underway.",
      },

      /*
       * EMMA
       * ------------------------------------------------
       */

      {
        userId: emma._id,
        projectId: marketing._id,
        weekStart: "2026-08-17",
        weekEnd: "2026-08-23",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Landing page redesign",
            priority: "HIGH",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 14,
            timeSpent: 13,
            output: "Responsive landing page",
          }),
          createTask({
            taskName: "SEO metadata updates",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 5,
            timeSpent: 4,
            output: "SEO metadata configuration",
          }),
        ],

        nextWeekTasks: [
          "Improve page performance",
          "Add analytics tracking",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed responsive landing page redesign.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 25,
          testing: 5,
          meetings: 4,
          research: 3,
          other: 1,
        },

        notes: "Marketing website redesign completed.",
      },

      {
        userId: emma._id,
        projectId: rnd._id,
        weekStart: "2026-08-24",
        weekEnd: "2026-08-30",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "AI prototype research",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 12,
            timeSpent: 11,
            output: "AI prototype evaluation",
          }),
          createTask({
            taskName: "Evaluate LLM providers",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 8,
            timeSpent: 7,
            output: "Provider comparison report",
          }),
        ],

        nextWeekTasks: [
          "Build proof of concept",
          "Document AI integration options",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed AI provider evaluation.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 20,
          testing: 4,
          meetings: 5,
          research: 12,
          other: 1,
        },

        notes: "AI research phase completed.",
      },

      {
        userId: emma._id,
        projectId: marketing._id,
        weekStart: "2026-08-31",
        weekEnd: "2026-09-06",
        status: "DRAFT",

        tasks: [
          createTask({
            taskName: "Marketing analytics integration",
            priority: "MEDIUM",
            plannedPercentage: 60,
            actualPercentage: 25,
            status: "IN_PROGRESS",
            timePlanned: 10,
            timeSpent: 4,
            output: "Initial analytics integration",
          }),
        ],

        nextWeekTasks: [
          "Complete analytics integration",
          "Create marketing dashboard",
        ],

        blockers: [],

        achievements: [],

        hours: {
          development: 8,
          testing: 1,
          meetings: 2,
          research: 2,
          other: 0,
        },

        notes: "Current week report is still a draft.",
      },

      /*
       * EXTRA R&D REPORT
       * Gives the dashboard another project/data point.
       */

      {
        userId: john._id,
        projectId: rnd._id,
        weekStart: "2026-08-24",
        weekEnd: "2026-08-30",
        status: "APPROVED",

        tasks: [
          createTask({
            taskName: "Evaluate caching strategy",
            priority: "MEDIUM",
            plannedPercentage: 100,
            actualPercentage: 100,
            timePlanned: 8,
            timeSpent: 7,
            output: "Caching strategy document",
          }),
        ],

        nextWeekTasks: [
          "Prototype Redis caching",
        ],

        blockers: [],

        achievements: [
          {
            description:
              "Completed caching strategy evaluation.",
            isKeyAchievement: true,
          },
        ],

        hours: {
          development: 8,
          testing: 2,
          meetings: 2,
          research: 8,
          other: 1,
        },

        notes: "Research completed.",
      },
    ];

    /*
     * ----------------------------------------------------
     * 5. CREATE REPORTS
     * ----------------------------------------------------
     */

    const createdReports = [];

    for (const definition of reportDefinitions) {
      let report = await Report.findOne({
        userId: definition.userId,
        weekStart: definition.weekStart,
        projectId: definition.projectId,
      });

      if (report) {
        console.log(
          `Report already exists: ${report._id}`
        );

        createdReports.push(report);
        continue;
      }

      report = await Report.create(definition);

      createdReports.push(report);

      console.log(
        `Created ${definition.status} report: ${report._id}`
      );
    }

    /*
     * ----------------------------------------------------
     * 6. CREATE VERSION HISTORY
     * ----------------------------------------------------
     */

    for (const report of createdReports) {
      const existingVersion = await ReportVersion.findOne({
        reportId: report._id,
        version: 1,
      });

      if (!existingVersion) {
        await ReportVersion.create({
          reportId: report._id,
          version: 1,
          content: {
            weekStart: report.weekStart,
            weekEnd: report.weekEnd,
            projectId: report.projectId,
            tasks: report.tasks,
            nextWeekTasks: report.nextWeekTasks,
            blockers: report.blockers,
            achievements: report.achievements,
            hours: report.hours,
            notes: report.notes,
          },
          submittedAt:
            report.status === "DRAFT"
              ? report.createdAt
              : report.updatedAt,
          submittedBy: report.userId,
        });

        console.log(
          `Created version 1 for report ${report._id}`
        );
      }
    }

    /*
     * ----------------------------------------------------
     * 7. CREATE CORRECTION VERSION FOR SARAH
     * ----------------------------------------------------
     *
     * Sarah's Needs Correction report gets:
     *
     * Version 1
     *       ↓
     * Manager requests correction
     *
     * Version 2
     *       ↓
     * Resubmitted
     *
     * This gives the version-history UI realistic data.
     */

    const sarahCorrectionReport =
      createdReports.find(
        (report) =>
          report.userId.toString() ===
            sarah._id.toString() &&
          report.weekStart.toISOString().startsWith(
            "2026-08-24"
          )
      );

    if (sarahCorrectionReport) {
      const versionCount =
        await ReportVersion.countDocuments({
          reportId: sarahCorrectionReport._id,
        });

      /*
       * Only create additional history once.
       */
      if (versionCount === 1) {
        const version1 =
          await ReportVersion.findOne({
            reportId: sarahCorrectionReport._id,
            version: 1,
          });

        /*
         * Manager correction review
         */
        const correctionReview =
          await Review.create({
            reportId: sarahCorrectionReport._id,
            versionId: version1?._id,
            reviewerId: admin._id,
            action: "REQUESTED_CORRECTION",
            comment:
              "Please provide more detail about the notification delivery testing and explain which test cases were completed.",
            createdAt: new Date(
              "2026-08-29T15:30:00Z"
            ),
          });

        console.log(
          `Created correction review: ${correctionReview._id}`
        );

        /*
         * Version 2 represents the corrected/resubmitted
         * content.
         */
        const version2 =
          await ReportVersion.create({
            reportId: sarahCorrectionReport._id,
            version: 2,
            content: {
              ...sarahCorrectionReport.toObject(),
              notes:
                "Updated report with additional notification testing details.",
              tasks:
                sarahCorrectionReport.tasks.map(
                  (task) => ({
                    ...task.toObject(),
                    output:
                      task.taskName ===
                      "Notification delivery tests"
                        ? "Added email delivery success, retry and failure test cases."
                        : task.output,
                  })
                ),
            },
            submittedAt: new Date(
              "2026-08-30T10:00:00Z"
            ),
            submittedBy: sarah._id,
          });

        /*
         * Resubmission review
         */
        await Review.create({
          reportId: sarahCorrectionReport._id,
          versionId: version2._id,
          reviewerId: sarah._id,
          action: "RESUBMITTED",
          comment:
            "Updated the report with additional testing details.",
          createdAt: new Date(
            "2026-08-30T10:05:00Z"
          ),
        });

        console.log(
          "Created Sarah's correction/version history"
        );
      }
    }

    /*
     * ----------------------------------------------------
     * 8. CREATE REVIEW HISTORY FOR APPROVED REPORTS
     * ----------------------------------------------------
     */

    for (const report of createdReports) {
      if (report.status !== "APPROVED") {
        continue;
      }

      const existingApproval =
        await Review.findOne({
          reportId: report._id,
          action: "APPROVED",
        });

      if (existingApproval) {
        continue;
      }

      const version =
        await ReportVersion.findOne({
          reportId: report._id,
          version: 1,
        });

      await Review.create({
        reportId: report._id,
        versionId: version?._id,
        reviewerId: admin._id,
        action: "APPROVED",
        comment:
          "Report reviewed and approved.",
      });

      console.log(
        `Created approval review for ${report._id}`
      );
    }

    /*
     * ----------------------------------------------------
     * 9. CREATE SUBMISSION REVIEWS
     * ----------------------------------------------------
     */

    for (const report of createdReports) {
      if (report.status !== "SUBMITTED") {
        continue;
      }

      const existingSubmission =
        await Review.findOne({
          reportId: report._id,
          action: "SUBMITTED",
        });

      if (existingSubmission) {
        continue;
      }

      const version =
        await ReportVersion.findOne({
          reportId: report._id,
          version: 1,
        });

      await Review.create({
        reportId: report._id,
        versionId: version?._id,
        reviewerId: report.userId,
        action: "SUBMITTED",
        comment: "Report submitted for manager review.",
      });

      console.log(
        `Created submission review for ${report._id}`
      );
    }

    /*
     * ----------------------------------------------------
     * SUMMARY
     * ----------------------------------------------------
     */

    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const reportCount = await Report.countDocuments();
    const versionCount =
      await ReportVersion.countDocuments();
    const reviewCount = await Review.countDocuments();

    console.log("\n=================================");
    console.log("      SEED DATA COMPLETE");
    console.log("=================================");
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Reports: ${reportCount}`);
    console.log(`Versions: ${versionCount}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log("=================================\n");

    console.log("Demo accounts:");
    console.log("---------------------------------");
    console.log("ADMIN");
    console.log("admin@example.com");
    console.log("Admin123!");
    console.log("---------------------------------");
    console.log("TEAM MEMBER");
    console.log("john@example.com");
    console.log("Member123!");
    console.log("---------------------------------");
    console.log("TEAM MEMBER");
    console.log("sarah@example.com");
    console.log("Member123!");
    console.log("---------------------------------");
    console.log("TEAM MEMBER");
    console.log("david@example.com");
    console.log("Member123!");
    console.log("---------------------------------");
    console.log("TEAM MEMBER");
    console.log("emma@example.com");
    console.log("Member123!");
    console.log("---------------------------------\n");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error("\nSeed failed:");
    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedData();