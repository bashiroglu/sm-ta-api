const AppModel = require("../models/appData");
const AppError = require("./appError");

const appId = "6463e1f2f9b6e6b2caa51c68";

/**
 * Call this function in pre save middleware in models
 * @param {*} next
 * @param {*} modifier
 * @param {*} digitCount
 * @returns
 */
exports.getCode = async (_, collectionName, modifier, digitCount = 4) => {
  const appDoc = await AppModel.findById(appId);
  const codeNumber = appDoc.get(collectionName) ?? 1;

  if (!appDoc) return next(new AppError("Could not get new code", 404));

  const code = `AA${modifier.toUpperCase()}${"0".repeat(
    digitCount - ("" + codeNumber).length,
  )}${codeNumber}`;

  appDoc.set(collectionName, codeNumber + 1, { strict: false });
  await appDoc.save();
  return code;
};

exports.getBalance = async () => {
  const appData = await AppModel.findById(appId);

  if (!appData) {
    return next(new AppError("Could not get new code", 404));
  }

  return appData.balance;
};

exports.changeBalance = async (amount) => {
  const appData = await AppModel.findById(appId);

  if (!appData) {
    return next(new AppError("Could not get balance", 404));
  }

  appData.balance += amount;

  return appData.save();
};
