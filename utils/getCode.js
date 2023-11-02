const mongoose = require("mongoose");
const CompanyModel = require("../models/companyModel");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

module.exports = (field, options) =>
  catchAsync(async (req, res, next) => {
    if (req.body.email === process.env.OWNER_EMAIL && field === "user")
      return "OWNER_CODE";
    const { modifier, digitCount } = options || {
      modifier: field.toUpperCase(),
      digitCount: 4,
    };
    const COMPANY_ID = process.env.COMPANY_ID;

    const obj = {};
    obj[field] = 1;

    const session = await mongoose.startSession();
    session.startTransaction();

    const company = await CompanyModel.findByIdAndUpdate(
      COMPANY_ID,
      { $inc: obj },
      { session }
    );

    if (!company) {
      await session.abortTransaction();
      return next(new AppError("Company not found with that ID", 404));
    }

    const codeCount = company[field];

    req.body.code = `${company.code}${modifier}${"0".repeat(
      digitCount - `${codeCount}`.length
    )}${codeCount + 1}`;
    req.session = session;
    next();
  });
