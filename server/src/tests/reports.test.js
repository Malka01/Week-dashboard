require("dotenv").config();

process.env.JWT_SECRET = "test-jwt-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

const User = require("../models/User");
const Report = require("../models/Report");

const { generateToken } = require("../utils/jwt");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Report.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("Reports API", () => {
  const createUser = async ({
    name = "Team Member",
    email = "member@example.com",
    role = "TEAM_MEMBER",
  } = {}) => {
    return await User.create({
      name,
      email,
      password: "Password@123",
      role,
      isActive: true,
    });
  };

  const getToken = (user) => {
    return generateToken(user);
  };

  const createReportData = (projectId) => ({
    weekStart: "2026-09-07",
    weekEnd: "2026-09-13",
    projectId: projectId || new mongoose.Types.ObjectId(),
    tasks: [
      {
        taskName: "Develop dashboard",
        priority: "HIGH",
        plannedPercentage: 100,
        actualPercentage: 80,
        status: "IN_PROGRESS",
        timePlanned: 20,
        timeSpent: 16,
        output: "Dashboard implementation completed",
      },
    ],
    nextWeekTasks: [
      "Complete dashboard",
      "Write unit tests",
    ],
    blockers: [
      {
        description: "Waiting for API specification",
        isKeyIssue: true,
      },
    ],
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
      research: 3,
      other: 1,
    },
    notes: "Weekly development work",
  });

  describe("Authentication", () => {
    test("should reject unauthenticated request", async () => {
      const response = await request(app)
        .get("/api/reports/my-reports");

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Authentication required"
      );
    });
  });

  describe("Create Report", () => {
    test("should create a report draft", async () => {
      const user = await createUser();
      const token = getToken(user);

      const projectId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData(projectId));

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Report draft created successfully"
      );

      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe("DRAFT");
      expect(response.body.data.userId.toString()).toBe(
        user._id.toString()
      );
    });

    test("should reject duplicate report for same week and project", async () => {
      const user = await createUser();
      const token = getToken(user);

      const projectId = new mongoose.Types.ObjectId();
      const reportData = createReportData(projectId);

      const firstResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      expect(firstResponse.statusCode).toBe(201);

      const secondResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      expect(secondResponse.statusCode).toBe(400);
      expect(secondResponse.body.success).toBe(false);

      expect(secondResponse.body.message).toBe(
        "You already have a report for this week and project"
      );
    });
  });

  describe("Get My Reports", () => {
    test("should return reports belonging to authenticated user", async () => {
      const user = await createUser();
      const token = getToken(user);

      const reportData = createReportData();

      await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(reportData);

      const response = await request(app)
        .get("/api/reports/my-reports")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("DRAFT");
    });

    test("should not return another user's reports", async () => {
      const user1 = await createUser({
        name: "User One",
        email: "user1@example.com",
      });

      const user2 = await createUser({
        name: "User Two",
        email: "user2@example.com",
      });

      const token1 = getToken(user1);
      const token2 = getToken(user2);

      await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token1}`)
        .send(createReportData());

      const response = await request(app)
        .get("/api/reports/my-reports")
        .set("Authorization", `Bearer ${token2}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("Get Report By ID", () => {
    test("should return user's report by ID", async () => {
      const user = await createUser();
      const token = getToken(user);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.report._id).toBe(reportId);

      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(Array.isArray(response.body.data.versions)).toBe(true);
    });

    test("should not allow user to access another user's report", async () => {
      const user1 = await createUser({
        name: "User One",
        email: "user1@example.com",
      });

      const user2 = await createUser({
        name: "User Two",
        email: "user2@example.com",
      });

      const token1 = getToken(user1);
      const token2 = getToken(user2);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token1}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${token2}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Report not found");
    });
  });

  describe("Update Report", () => {
    test("should update a draft report", async () => {
      const user = await createUser();
      const token = getToken(user);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          notes: "Updated weekly notes",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Report updated successfully"
      );

      expect(response.body.data.notes).toBe(
        "Updated weekly notes"
      );
    });

    test("should not update a submitted report", async () => {
      const user = await createUser();
      const token = getToken(user);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      const submitResponse = await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      expect(submitResponse.statusCode).toBe(200);
      expect(submitResponse.body.data.status).toBe("SUBMITTED");

      const updateResponse = await request(app)
        .put(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          notes: "Trying to edit submitted report",
        });

      expect(updateResponse.statusCode).toBe(400);
      expect(updateResponse.body.success).toBe(false);

      expect(updateResponse.body.message).toBe(
        "Only Draft or Needs Correction reports can be edited"
      );
    });
  });

  describe("Submit Report", () => {
    test("should submit a draft report", async () => {
      const user = await createUser();
      const token = getToken(user);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      const response = await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Report submitted successfully"
      );

      expect(response.body.data.status).toBe("SUBMITTED");
    });

    test("should not submit an already submitted report", async () => {
      const user = await createUser();
      const token = getToken(user);

      const createResponse = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${token}`)
        .send(createReportData());

      const reportId = createResponse.body.data._id;

      await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      const secondResponse = await request(app)
        .post(`/api/reports/${reportId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      expect(secondResponse.statusCode).toBe(400);
      expect(secondResponse.body.success).toBe(false);

      expect(secondResponse.body.message).toBe(
        "Only Draft or Needs Correction reports can be submitted"
      );
    });
  });
});