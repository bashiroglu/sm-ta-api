const catchAsync = require("../utils/catchAsync");

const incrementViewCount = catchAsync(async (req, res, next) => {
  req.body = { $inc: { viewCount: 1 } };
  req.query.fields = "viewCount";
  next();
});

module.exports = { incrementViewCount };
