const catchAsync = require("../utils/catchAsync");

const restrictFeedbacks = catchAsync(async (req, res, next) => {
  if (req.user.roles.includes("teacher")) {
    req.query.createdBy = req.user.id;
  }
  if (req.user.roles.includes("guardian")) {
    req.query.student = { $in: req.user.children };
  }
  next();
});

module.exports = { restrictFeedbacks };
