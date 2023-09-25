const CompanyModel = require("../models/companyModel");
const AppError = require("./appError");

const companyId = process.env.COMPANY_ID;

exports.getCode = async (next, collectionName, modifier, digitCount = 4) => {
  const company = await CompanyModel.findById(companyId);
  const codeNumber = company.get(collectionName) ?? 1;

  if (!company) return next(new AppError("Could not get new code", 404));

  const code = `${company.code}${modifier.toUpperCase()}${"0".repeat(
    digitCount - ("" + codeNumber).length
  )}${codeNumber}`;

  company.set(collectionName, codeNumber + 1, { strict: false });
  await company.save();
  return code;
};

exports.getBalance = async () => {
  const appData = await CompanyModel.findById(companyId);

  if (!appData) {
    return next(new AppError("Could not get new code", 404));
  }

  return appData.balance;
};

exports.changeBalance = async (amount) => {
  const appData = await CompanyModel.findById(companyId);

  if (!appData) {
    return next(new AppError("Could not get balance", 404));
  }

  appData.balance += amount;

  return appData.save();
};
