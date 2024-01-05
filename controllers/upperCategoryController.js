const Model = require("../models/upperCategoryModel");
const LowerCategoryModel = require("../models/lowerCategoryModel");
const catchAsync = require("../utils/catchAsync");

const createUpperAndLowers = catchAsync(async (req, res, next) => {
  const { upper, lowers } = req.body;
  const session = req.session || (await mongoose.startSession());
  if (!req.session) session.startTransaction();
  let upperDoc;
  if (typeof upper === "string") {
    upperDoc = await Model.findById(upper);
  } else {
    [upperDoc] = await Model.create([upper], { session });
  }

  lowers.forEach((lower) => (lower.upperCategory = upperDoc._id));

  const lowerDocs = await LowerCategoryModel.insertMany(lowers, { session });

  req.doc = { upperCategory: upperDoc, lowerCategories: lowerDocs };
  await session.commitTransaction();
  session.endSession();
  next();
});

module.exports = { createUpperAndLowers };
