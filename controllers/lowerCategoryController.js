const factory = require("./helpers/handlerFactory");
const catchAsync = require("../utils/catchAsync");
const LowerCategoryModel = require("../models/lowerCategoryModel");
const UpperCategoryModel = require("../models/upperCategoryModel");
const { roles } = require("../utils/constants/enums");
const AppError = require("../utils/appError");

exports.getLowerCategories = factory.getAll(LowerCategoryModel);
exports.getLowerCategory = factory.getOne(LowerCategoryModel);
exports.createLowerCategory = factory.createOne(LowerCategoryModel);
exports.updateLowerCategory = factory.updateOne(LowerCategoryModel);
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
        slug: 1,
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

exports.queryByUpperSlug2 = catchAsync(async (req, res, next) => {
  req.doc = await LowerCategoryModel.find({ deleted: { $ne: true } })
    .populate({
      path: "upperCategory",
      match: {
        deleted: { $ne: true },
        slug: req.params.slug,
      },
      select: "title slug",
    })
    .select("title description priority upperCategory")
    .sort({ priority: -1 });

  next();
});

exports.sortDescending = catchAsync(async (req, res, next) => {
  req.query.sort = "-priority";
  next();
});

exports.checkDeletability = catchAsync(async (req, res, next) => {
  const lower = await LowerCategoryModel.findById(req.params.id);
  if (!lower) return next(new AppError("doc_not_found", 404));

  const notOwnerOrAdmin = !req.user.roles.some((role) =>
    [roles.OWNER, roles.ADMIN].includes(role)
  );

  if (!lower.deletable || notOwnerOrAdmin)
    return next(new AppError("immutable_field_delete", 400));

  next();
});

exports.checkRestriction = catchAsync(async (req, res, next) => {
  const upper = await UpperCategoryModel.findById(req.body.upperCategory);
  if (!upper) return next(new AppError("upper_not_found", 404));
  if (upper.restricted) return next(new AppError("upper_restricted", 404));
  next();
});
