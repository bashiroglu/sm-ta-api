const factory = require("./helpers/handlerFactory");
const BonusModel = require("../models/bonusModel");
const UserModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getBonuses = factory.getAll(BonusModel);
exports.getBonus = factory.getOne(BonusModel);
exports.createBonus = factory.createOne(BonusModel);
exports.updateBonus = factory.updateOne(BonusModel);
exports.deleteBonus = factory.deleteOne(BonusModel);

exports.checkBonus = catchAsync(async (req, res, next) => {
  const { url } = req;
  console.log(url);
  const { recipients } = await BonusModel.findOne({ endpoint: url });

  if (!recipients) return next(new AppError("doc_not_found", 404));

  const userIds = recipients.map((r) => r.user);

  const users = await UserModel.find({ $in: { _id: userIds } });

  console.log(users);

  next();
});
