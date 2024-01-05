const catchAsync = require("../utils/catchAsync");

const assignUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

module.exports = { assignUser };
