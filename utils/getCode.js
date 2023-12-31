const mongoose = require("mongoose");
const CompanyModel = require("../models/companyModel");
const AppError = require("./appError");
const catchAsync = require("./catchAsync");

/**
 * Add this middleware before create middleware.
 *
 * Add collection name to (singular) to company
 * model as field
 *
 * @param {*} field
 * @param {*} options
 * @returns
 */
module.exports = (field, { modifier, digitCount = 4 } = {}) =>
  catchAsync(async (req, res, next) => {
    let session = req.session;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
      req.session = session;
    }

    if (req.body.email === process.env.OWNER_EMAIL && field === "user") {
      req.body.code = "OWNER_CODE";
      return next();
    }

    const COMPANY_ID = process.env.COMPANY_ID;
    if (!COMPANY_ID) {
      return next(new AppError("company_id_not_assigned", 400));
    }

    const obj = {};
    obj[field] = req.count || 1;

    const company = await CompanyModel.findByIdAndUpdate(
      COMPANY_ID,
      { $inc: obj },
      { session }
    );

    if (!company) return next(new AppError("company_not_found", 404));

    const codeCount = company[field];

    const codes = Array.from(
      { length: req.count || 1 },
      (_, i) =>
        `${company.code}${modifier ?? field.toUpperCase()}${"0".repeat(
          digitCount - `${codeCount + i}`.length
        )}${codeCount + 1 + i}`
    );

    req.body.code = !req.count ? codes.at(0) : codes;

    next();
  });
