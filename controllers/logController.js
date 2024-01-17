const Model = require("../models/logModel");
const catchAsync = require("../utils/catchAsync");

const createLog = catchAsync(async (req, res, next) => {
  next();
});

module.exports = { checkBonus };
