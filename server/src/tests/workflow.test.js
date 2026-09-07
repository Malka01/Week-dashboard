require("dotenv").config();

process.env.JWT_SECRET = "test-jwt-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

const User = require("../models/User");
const Report = require("../models/Report");
const Review = require("../models/Review");
const ReportVersion = require("../models/ReportVersion");

const { generateToken } = require("../utils/jwt");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Review.deleteMany({});
  await ReportVersion.deleteMany({});
  await Report.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("Report Workflow", () => {
  const createUser = async ({
    name,
    email,
    role,
  }) => {
    return await User.create({
      name,
      email,
      password: "Password@123",
      role,
      isActive: true,
    });
  };

  const createReportData = () => ({
    weekStart: "2026-09-07",
    weekEnd: "2026-09-13",

    // Report model only requires a valid ObjectId.
    // Project existence is not checked by reportService.
    projectId: new mongoose.Types.ObjectId(),

    tasks: [
      {
        taskName: "Develop dashboard",
        priority: "HIGH",
        plannedPercentage: 100,
        actualPercentage: 80,
        status: "IN_PROGRESS",
        timePlanned: 20,
        timeSpent: 16,
        output: "Dashboard development completed",
      },
    ],

    nextWeekTasks: [
      "Complete dashboard",
      "Write unit tests",
    ],

    blockers: [],

    achievements: [
      {
        description: "Completed dashboard UI",
        isKeyAchievement: true,
      },
    ],

    hours: {
      development: 16,
      testing: 4,
      meetings: 2,
      research: 2,
      other: 0,
    },

    notes: "Weekly report",
  });

  test("should complete the report approval workflow", async () => {
    // --------------------------------------------------
    // 1. Create users
    // --------------------------------------------------

    const teamMember = await createUser({
      name: "Team Member",
      email: "member@example.com",
      role: "TEAM_MEMBER",
    });

    const admin = await createUser({
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const teamToken = generateToken(teamMember);
    const adminToken = generateToken(admin);

    // --------------------------------------------------
    // 2. Team member creates report
    // --------------------------------------------------

    const createResponse = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${teamToken}`)
      .send(createReportData());

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.success).toBe(true);

    const reportId = createResponse.body.data._id;

    expect(createResponse.body.data.status).toBe("DRAFT");

    // --------------------------------------------------
    // 3. Team member submits report
    // --------------------------------------------------

    const submitResponse = await request(app)
      .post(`/api/reports/${reportId}/submit`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(submitResponse.statusCode).toBe(200);
    expect(submitResponse.body.success).toBe(true);

    expect(submitResponse.body.data.status).toBe(
      "SUBMITTED"
    );

    // --------------------------------------------------
    // 4. Verify version was created
    // --------------------------------------------------

    const versionsAfterSubmit =
      await ReportVersion.find({
        reportId,
      });

    expect(versionsAfterSubmit).toHaveLength(1);
    expect(versionsAfterSubmit[0].version).toBe(1);

    expect(
      versionsAfterSubmit[0].submittedBy.toString()
    ).toBe(teamMember._id.toString());

    // --------------------------------------------------
    // 5. Verify SUBMITTED review was created
    // --------------------------------------------------

    const submitReviews = await Review.find({
      reportId,
    });

    expect(submitReviews).toHaveLength(1);

    expect(submitReviews[0].action).toBe(
      "SUBMITTED"
    );

    expect(
      submitReviews[0].reviewerId.toString()
    ).toBe(teamMember._id.toString());

    // --------------------------------------------------
    // 6. Admin requests correction
    // --------------------------------------------------

    const correctionResponse = await request(app)
      .post(
        `/api/admin/reports/${reportId}/request-correction`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        comment:
          "Please provide more details about the completed tasks.",
      });

    expect(correctionResponse.statusCode).toBe(200);
    expect(correctionResponse.body.success).toBe(true);

    expect(
      correctionResponse.body.data.report.status
    ).toBe("NEEDS_CORRECTION");

    expect(
      correctionResponse.body.data.review.action
    ).toBe("REQUESTED_CORRECTION");

    expect(
      correctionResponse.body.data.review.comment
    ).toBe(
      "Please provide more details about the completed tasks."
    );

    // --------------------------------------------------
    // 7. Team member edits report
    // --------------------------------------------------

    const updateResponse = await request(app)
      .put(`/api/reports/${reportId}`)
      .set("Authorization", `Bearer ${teamToken}`)
      .send({
        notes:
          "Updated report with additional task details.",
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.success).toBe(true);

    expect(updateResponse.body.data.notes).toBe(
      "Updated report with additional task details."
    );

    // --------------------------------------------------
    // 8. Team member resubmits
    // --------------------------------------------------

    const resubmitResponse = await request(app)
      .post(`/api/reports/${reportId}/submit`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(resubmitResponse.statusCode).toBe(200);
    expect(resubmitResponse.body.success).toBe(true);

    expect(resubmitResponse.body.data.status).toBe(
      "SUBMITTED"
    );

    // --------------------------------------------------
    // 9. Verify second version was created
    // --------------------------------------------------

    const versionsAfterResubmit =
      await ReportVersion.find({
        reportId,
      }).sort({ version: 1 });

    expect(versionsAfterResubmit).toHaveLength(2);

    expect(versionsAfterResubmit[0].version).toBe(1);
    expect(versionsAfterResubmit[1].version).toBe(2);

    // --------------------------------------------------
    // 10. Verify RESUBMITTED review
    // --------------------------------------------------

    const reviewsAfterResubmit = await Review.find({
      reportId,
    }).sort({ createdAt: 1 });

    expect(reviewsAfterResubmit).toHaveLength(3);

    expect(reviewsAfterResubmit[0].action).toBe(
      "SUBMITTED"
    );

    expect(reviewsAfterResubmit[1].action).toBe(
      "REQUESTED_CORRECTION"
    );

    expect(reviewsAfterResubmit[2].action).toBe(
      "RESUBMITTED"
    );

    // --------------------------------------------------
    // 11. Admin approves report
    // --------------------------------------------------

    const approveResponse = await request(app)
      .post(`/api/admin/reports/${reportId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        comment: "Report looks good. Approved.",
      });

    expect(approveResponse.statusCode).toBe(200);
    expect(approveResponse.body.success).toBe(true);

    expect(
      approveResponse.body.data.report.status
    ).toBe("APPROVED");

    expect(
      approveResponse.body.data.review.action
    ).toBe("APPROVED");

    expect(
      approveResponse.body.data.review.comment
    ).toBe("Report looks good. Approved.");

    // --------------------------------------------------
    // 12. Verify final database state
    // --------------------------------------------------

    const finalReport =
      await Report.findById(reportId);

    expect(finalReport.status).toBe("APPROVED");

    const finalReviews = await Review.find({
      reportId,
    }).sort({ createdAt: 1 });

    expect(finalReviews).toHaveLength(4);

    expect(finalReviews.map((review) => review.action))
      .toEqual([
        "SUBMITTED",
        "REQUESTED_CORRECTION",
        "RESUBMITTED",
        "APPROVED",
      ]);

    const finalVersions =
      await ReportVersion.find({
        reportId,
      }).sort({ version: 1 });

    expect(finalVersions).toHaveLength(2);
    expect(finalVersions[0].version).toBe(1);
    expect(finalVersions[1].version).toBe(2);
  });

  test("should not allow ADMIN to request correction for a DRAFT report", async () => {
    const teamMember = await createUser({
      name: "Team Member",
      email: "member@example.com",
      role: "TEAM_MEMBER",
    });

    const admin = await createUser({
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const teamToken = generateToken(teamMember);
    const adminToken = generateToken(admin);

    const createResponse = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${teamToken}`)
      .send(createReportData());

    const reportId = createResponse.body.data._id;

    const response = await request(app)
      .post(
        `/api/admin/reports/${reportId}/request-correction`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        comment: "Please fix this report.",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Only submitted reports can be sent for correction"
    );
  });

  test("should not allow ADMIN to approve a DRAFT report", async () => {
    const teamMember = await createUser({
      name: "Team Member",
      email: "member@example.com",
      role: "TEAM_MEMBER",
    });

    const admin = await createUser({
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const teamToken = generateToken(teamMember);
    const adminToken = generateToken(admin);

    const createResponse = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${teamToken}`)
      .send(createReportData());

    const reportId = createResponse.body.data._id;

    const response = await request(app)
      .post(`/api/admin/reports/${reportId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        comment: "Approved",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Only submitted reports can be approved"
    );
  });

  test("should require a correction comment", async () => {
    const teamMember = await createUser({
      name: "Team Member",
      email: "member@example.com",
      role: "TEAM_MEMBER",
    });

    const admin = await createUser({
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const teamToken = generateToken(teamMember);
    const adminToken = generateToken(admin);

    const createResponse = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${teamToken}`)
      .send(createReportData());

    const reportId = createResponse.body.data._id;

    await request(app)
      .post(`/api/reports/${reportId}/submit`)
      .set("Authorization", `Bearer ${teamToken}`);

    const response = await request(app)
      .post(
        `/api/admin/reports/${reportId}/request-correction`
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        comment: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "A correction comment is required"
    );
  });

  test("should prevent TEAM_MEMBER from accessing admin workflow", async () => {
    const teamMember = await createUser({
      name: "Team Member",
      email: "member@example.com",
      role: "TEAM_MEMBER",
    });

    const token = generateToken(teamMember);

    const response = await request(app)
      .get("/api/admin/reports")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
});