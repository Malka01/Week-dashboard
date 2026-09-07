const request = require("supertest");
const app = require("../app");

describe("Health Check", () => {
  test("GET /api/health should return 200", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);
  });
});