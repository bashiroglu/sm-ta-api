const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const LowerCategoryModel = require("../models/lowerCategoryModel");

exports.getLowerCategories = factory.getAll(LowerCategoryModel);
exports.getLowerCategory = factory.getOne(LowerCategoryModel);
exports.createLowerCategory = factory.createOne(LowerCategoryModel);
exports.updateLowerCategory = factory.updateOne(LowerCategoryModel);
exports.makeDeletedLowerCategory = factory.makeDeletedOne(LowerCategoryModel);
exports.deleteLowerCategory = factory.deleteOne(LowerCategoryModel);

exports.queryByUpperSlug = catchAsync(async (req, res, next) => {
  req.pipeline = LowerCategoryModel.aggregate([
    {
      $match: {
        deleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "uppercategories",
        localField: "upperCategory",
        foreignField: "_id",
        as: "uppers",
      },
    },
    {
      $unwind: "$uppers",
    },
    {
      $match: {
        "uppers.deleted": { $ne: true },
        "uppers.slug": req.params.slug,
      },
    },
    {
      $project: {
        title: 1,
        upperCategory: 1,
        description: 1,
        priority: 1,
      },
    },
    {
      $sort: {
        priority: -1,
      },
    },
  ]);
  next();
});

exports.sortDescending = catchAsync(async (req, res, next) => {
  req.query.sort = "-priority";
  next();
});
