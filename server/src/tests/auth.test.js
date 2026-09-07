require("dotenv").config();

process.env.JWT_SECRET = "test-jwt-secret";


const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/User");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();
});

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    test("should register a new team member", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "Password@123",
        });

      expect(response.statusCode).toBe(201);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Registration successful"
      );

      expect(response.body.data.token).toBeDefined();

      expect(response.body.data.user.name).toBe("Test User");

      expect(response.body.data.user.email).toBe(
        "test@example.com"
      );

      expect(response.body.data.user.role).toBe(
        "TEAM_MEMBER"
      );
    });

    test("should not register a user with an existing email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "First User",
          email: "duplicate@example.com",
          password: "Password@123",
        });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Second User",
          email: "duplicate@example.com",
          password: "Password@123",
        });

      expect(response.statusCode).toBe(400);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "User already exists"
      );
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login with valid credentials", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Login User",
          email: "login@example.com",
          password: "Password@123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "Password@123",
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Login successful"
      );

      expect(response.body.data.token).toBeDefined();

      expect(response.body.data.user.email).toBe(
        "login@example.com"
      );

      expect(response.body.data.user.role).toBe(
        "TEAM_MEMBER"
      );
    });

    test("should reject an incorrect password", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Login User",
          email: "wrong-password@example.com",
          password: "Password@123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "wrong-password@example.com",
          password: "WrongPassword@123",
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });

    test("should reject an unknown email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "Password@123",
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });

    test("should reject an inactive user", async () => {
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Inactive User",
          email: "inactive@example.com",
          password: "Password@123",
        });

      const userId = registerResponse.body.data.user.id;

      await User.findByIdAndUpdate(userId, {
        isActive: false,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inactive@example.com",
          password: "Password@123",
        });

      expect(response.statusCode).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe(
        "User account is inactive"
      );
    });
  });
});