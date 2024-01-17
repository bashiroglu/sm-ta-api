const Model = require("../models/bonusModel");
const UserModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createLog = catchAsync(async (req, res, next) => {
  next();
});

module.exports = { checkBonus };
