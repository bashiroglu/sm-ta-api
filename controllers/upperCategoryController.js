const factory = require("./helpers/handlerFactory");
const UpperCategoryModel = require("../models/upperCategoryModel");
const LowerCategoryModel = require("../models/lowerCategoryModel");
const catchAsync = require("../utils/catchAsync");

exports.getUpperCategories = factory.getAll(UpperCategoryModel);
exports.getUpperCategory = factory.getOne(UpperCategoryModel);
exports.createUpperCategory = factory.createOne(UpperCategoryModel);
exports.updateUpperCategory = factory.updateOne(UpperCategoryModel);
exports.deleteUpperCategory = factory.deleteOne(UpperCategoryModel);

exports.createUpperAndLowers = catchAsync(async (req, res, next) => {
  const { upper, lowers } = req.body;
  const session = req.session || (await mongoose.startSession());
  if (!req.session) session.startTransaction();
  let upperDoc;
  if (typeof upper === "string") {
    upperDoc = await UpperCategoryModel.findById(upper);
  } else {
    [upperDoc] = await UpperCategoryModel.create([upper], { session });
  }

  lowers.forEach((lower) => (lower.upperCategory = upperDoc._id));

  const lowerDocs = await LowerCategoryModel.insertMany(lowers, { session });

  req.doc = { upperCategory: upperDoc, lowerCategories: lowerDocs };
  await session.commitTransaction();
  session.endSession();
  next();
});
