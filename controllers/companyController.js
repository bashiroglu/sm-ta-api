const factory = require("./helpers/handlerFactory");
const CompanyModel = require("../models/companyModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getCompany = factory.getOne(CompanyModel);
exports.getCompanies = factory.getAll(CompanyModel);
exports.createCompany = factory.createOne(CompanyModel);
exports.updateCompany = factory.updateOne(CompanyModel);
exports.makeDeletedCompany = factory.makeDeletedOne(CompanyModel);
exports.deleteCompany = factory.deleteOne(CompanyModel);

exports.checkConstruction = catchAsync(async (req, res, next) => {
  const company = await CompanyModel.findById(process.env.COMPANY_ID);
  if (!company || company.isUnderConstruction)
    return next(new AppError("under_construction", 400));
  res.status(200).json({ status: "success" });
});
