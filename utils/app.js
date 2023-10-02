const CompanyModel = require("../models/companyModel");
const AppError = require("./appError");

const getCompanyId = () => process.env.COMPANY_ID;

exports.getCode = async (next, collectionName, modifier, digitCount = 4) => {
  collectionName = collectionName.toLowerCase();
  const company = await CompanyModel.findById(getCompanyId());
  if (!company)
    return next(
      new AppError("Company not found to assign code to your document.")
    );

  const codeCount = company.get(collectionName.toLowerCase()) || 0;

  if (!company) return next(new AppError("Could not get new code", 404));

  const code = `${company.code}${modifier}${"0".repeat(
    digitCount - `${codeCount}`.length
  )}${codeCount + 1}`;

  company.set(collectionName, codeCount + 1, { strict: false });
  await company.save();
  return code;
};

exports.getBalance = async () => {
  const appData = await CompanyModel.findById(getCompanyId());

  if (!appData) {
    return next(new AppError("Could not get new code", 404));
  }

  return appData.balance;
};

exports.changeBalance = async (amount) => {
  const appData = await CompanyModel.findById(getCompanyId());

  if (!appData) {
    return next(new AppError("Could not get balance", 404));
  }

  appData.balance += amount;

  return appData.save();
};
