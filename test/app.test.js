const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");

describe("Express App", () => {
  it("responds with 404 for unknown routes", async () => {
    const response = await request(app).get("/nonexistent-route");
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property("status").equal("fail");
    expect(response.body).to.have.property("message").equal("Route not found");
  });

  it("responds with rate limit message for too many requests", async () => {
    // Mock multiple requests to trigger rate limit
    const manyRequests = Array.from({ length: 1100 }).map(() =>
      request(app).get("/api/users")
    );

    // Wait for all requests to complete
    const responses = await Promise.all(
      manyRequests.map((req) => req.catch((err) => err))
    );

    responses.forEach((response) => {
      if (response instanceof Error) {
        expect(response.response.status).to.equal(429);
        expect(response.response.body)
          .to.have.property("message")
          .equal("many_request");
      } else {
        expect(response.status).not.to.equal(429);
      }
    });
  });

  // Add more test cases for specific routes, middleware, etc.
});
