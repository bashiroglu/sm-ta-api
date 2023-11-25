const mongoose = require("mongoose");
const CompanyModel = require("../models/companyModel");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

module.exports = (field, options) =>
  catchAsync(async (req, res, next) => {
    const COMPANY_ID = process.env.COMPANY_ID;
    if (!COMPANY_ID) return next(new AppError("company_id_not_assigned", 404));

    if (req.body.email === process.env.OWNER_EMAIL && field === "user") {
      req.body.code = "OWNER_CODE";
      return next();
    }
    const { modifier, digitCount } = options || {
      modifier: field.toUpperCase(),
      digitCount: 4,
    };

    const obj = {};
    obj[field] = 1;

    const session = req.session || (await mongoose.startSession());
    if (!req.session) session.startTransaction();

    const company = await CompanyModel.findByIdAndUpdate(
      COMPANY_ID,
      { $inc: obj },
      { session }
    );

    if (!company) return next(new AppError("company_not_found", 404));

    const codeCount = company[field];

    req.body.code = `${company.code}${modifier}${"0".repeat(
      digitCount - `${codeCount}`.length
    )}${codeCount + 1}`;
    next();
  });
