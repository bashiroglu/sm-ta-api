const Model = require("../models/bonusModel");
const UserModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const checkBonus = catchAsync(async (req, res, next) => {
  const { url } = req;
  const { recipients } = await Model.findOne({ endpoint: url });

  if (!recipients) return next(new AppError("doc_not_found", 404));

  const userIds = recipients.map((r) => r.user);

  const users = await UserModel.find({ $in: { _id: userIds } });

  next();
});

module.exports = { checkBonus };
