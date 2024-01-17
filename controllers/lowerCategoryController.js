const catchAsync = require("../utils/catchAsync");
const UpperCategoryModel = require("../models/upperCategoryModel");
const { roles } = require("../utils/constants/enums");
const AppError = require("../utils/appError");

const sortDescending = catchAsync(async (req, res, next) => {
  req.query.sort = "-priority";
  next();
});

const checkDeletability = catchAsync(async (req, res, next) => {
  const lower = await LowerCategoryModel.findById(req.params.id);
  if (!lower) return next(new AppError("doc_not_found", 404));

  const notAdmin = !req.user.roles.some((role) => roles.ADMIN === role);

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

module.exports = {
  sortDescending,
  checkDeletability,
  checkRestriction,
};
