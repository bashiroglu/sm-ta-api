const catchAsync = require("../utils/catchAsync");

const restrictFeedbacks = catchAsync(async (req, res, next) => {
  if (req.user.roles.includes("teacher")) {
    req.query.createdBy = req.user.id;
  }
  next();
});

module.exports = { restrictFeedbacks };
