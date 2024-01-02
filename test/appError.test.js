const { expect } = require("chai");
const AppError = require("../utils/appError");

describe("AppError", () => {
  it("should create an AppError instance with proper properties", () => {
    const errorMessage = "Test error message";
    const statusCode = 404;
    const options = { field: "slug" };

    const appErr = new AppError(errorMessage, statusCode, options);

    expect(appErr).to.be.an.instanceOf(Error);
    expect(appErr).to.be.an.instanceOf(AppError);
    expect(appErr.message).to.equal(errorMessage);
    expect(appErr.statusCode).to.equal(statusCode);
    expect(appErr.status).to.equal("fail");
    expect(appErr.isOperational).to.equal(true);
    expect(appErr.options).to.deep.equal(options);
  });

  it('should default to "error" status for non-4xx status codes', () => {
    const errorMessage = "Test error message";
    const statusCode = 500;
    const options = { reason: "Internal server error" };

    const appErr = new AppError(errorMessage, statusCode, options);

    expect(appErr.status).to.equal("error");
  });
});
