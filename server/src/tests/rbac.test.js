require("dotenv").config();

process.env.JWT_SECRET = "test-jwt-secret";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("RBAC - Role Based Access Control", () => {
  const createUser = async (role) => {
    return await User.create({
      name: role === "ADMIN" ? "Admin User" : "Team Member",
      email:
        role === "ADMIN"
          ? "admin@example.com"
          : "member@example.com",
      password: "Password@123",
      role,
      isActive: true,
    });
  };

  describe("Admin Analytics Access", () => {
    test("should reject unauthenticated user", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/dashboard");

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should reject TEAM_MEMBER", async () => {
      const teamMember = await createUser("TEAM_MEMBER");

      const token = generateToken(teamMember);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should allow ADMIN", async () => {
      const admin = await createUser("ADMIN");

      const token = generateToken(admin);

      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});