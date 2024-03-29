const catchAsync = require("../utils/catchAsync");
const Model = require("../models/lowerCategoryModel");
const UpperCategoryModel = require("../models/upperCategoryModel");
const { roles } = require("../utils/constants/enums");
const AppError = require("../utils/appError");

const queryByUpperSlug = catchAsync(async (req, res, next) => {
  req.pipeline = Model.aggregate([
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

const sortDescending = catchAsync(async (req, res, next) => {
  req.query.sort = "-priority";
  next();
});

// TODO: Use this if needed
const checkDeletability = catchAsync(async (req, res, next) => {
  if (!req.baseUrl.endsWith("lower-categories")) return next();
  const lower = await Model.findById(req.params.id);
  if (!lower) return next(new AppError("doc_not_found", 404));

  const notAdmin = !req.user.roles.some((role) => role === roles.ADMIN);

  if (!lower.deletable || notAdmin)
    return next(new AppError("immutable_field_delete", 400));

  next();
});

const checkRestriction = catchAsync(async (req, res, next) => {
  const upper = await UpperCategoryModel.findById(req.body.upperCategory);
  if (!upper) return next(new AppError("upper_not_found", 404));
  if (upper.restricted) return next(new AppError("upper_restricted", 404));
  next();
});

const incrementPriority = async (req) => {
  let {
    body: { category },
    session,
  } = req;
  const lower = await Model.findByIdAndUpdate(category, {
    $inc: { priority: 1 },
  }).session(session);
  if (!lower) return { message: "lower_category_not_found" };
  return lower;
};

module.exports = {
  queryByUpperSlug,
  sortDescending,
  checkDeletability,
  checkRestriction,
  incrementPriority,
};
