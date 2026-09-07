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

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await User.deleteMany({});
  await Report.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("Analytics Dashboard", () => {
  // --------------------------------------------------
  // Helper: Create user
  // --------------------------------------------------

  const createUser = async (role = "TEAM_MEMBER") => {
    const user = await User.create({
      name: role === "ADMIN" ? "Admin User" : "Team Member",
      email:
        role === "ADMIN"
          ? "admin@example.com"
          : "member@example.com",
      password: "Password@123",
      role,
      isActive: true,
    });

    return user;
  };

  // --------------------------------------------------
  // GET /api/admin/analytics/dashboard
  // --------------------------------------------------

  describe("GET /api/admin/analytics/dashboard", () => {
    test("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/dashboard");

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Authentication required"
      );
    });

    test("should reject TEAM_MEMBER access", async () => {
      const teamMember = await createUser("TEAM_MEMBER");

      const token = generateToken(teamMember);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(403);

      expect(response.body.success).toBe(false);
    });

    test("should allow ADMIN access", async () => {
      const admin = await createUser("ADMIN");

      const token = generateToken(admin);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toBeDefined();

      expect(response.body.data.summary).toBeDefined();

      expect(response.body.data.teamCompliance).toBeDefined();

      expect(
        response.body.data.statusDistribution
      ).toBeDefined();

      expect(
        response.body.data.reportsByMember
      ).toBeDefined();

      expect(
        response.body.data.workloadByProject
      ).toBeDefined();

      expect(
        response.body.data.taskCompletion
      ).toBeDefined();

      expect(
        response.body.data.timeByTaskType
      ).toBeDefined();

      expect(
        response.body.data.taskCompletionTrend
      ).toBeDefined();

      expect(
        response.body.data.reportsWithBlockers
      ).toBeDefined();

      expect(
        response.body.data.recentActivity
      ).toBeDefined();
    });

    test("should return zero analytics when there are no reports", async () => {
      const admin = await createUser("ADMIN");

      const token = generateToken(admin);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data.summary.totalReports).toBe(0);

      expect(
        response.body.data.summary.submittedReports
      ).toBe(0);

      expect(
        response.body.data.summary.approvedReports
      ).toBe(0);

      expect(
        response.body.data.summary.correctionReports
      ).toBe(0);

      expect(
        response.body.data.summary.draftReports
      ).toBe(0);

      expect(
        response.body.data.summary.totalTeamMembers
      ).toBe(0);

      expect(
        response.body.data.summary.compliancePercentage
      ).toBe(0);

      expect(
        response.body.data.teamCompliance
      ).toEqual([]);

      expect(
        response.body.data.statusDistribution
      ).toEqual([]);

      expect(
        response.body.data.reportsByMember
      ).toEqual([]);

      expect(
        response.body.data.workloadByProject
      ).toEqual([]);

      expect(
        response.body.data.reportsWithBlockers
      ).toEqual([]);

      expect(
        response.body.data.recentActivity
      ).toEqual([]);
    });

    test("should accept analytics filters", async () => {
      const admin = await createUser("ADMIN");

      const token = generateToken(admin);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .query({
          status: "APPROVED",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data).toBeDefined();

      expect(response.body.data.summary).toBeDefined();
    });
  });
});