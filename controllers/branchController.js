const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");
const catchAsync = require("../utils/catchAsync");

exports.getBranches = factory.getAll(BranchModel);
exports.getBranch = factory.getOne(BranchModel);
exports.createBranch = factory.createOne(BranchModel);
exports.updateBranch = factory.updateOne(BranchModel);
exports.archiveBranch = factory.archiveOne(BranchModel);
exports.deleteBranch = factory.deleteOne(BranchModel);

exports.assignCompany = catchAsync(async (req, res, next) => {
  req.body.company = process.env.COMPANY_ID;
  next();
});

// exports.localRestrictTo = catchAsync(async (req, res, next) => {
//   // const id = req.url.replace("/", "");
//   req.isAllowed = true;
//   //   req.user.roles.includes("manager") &&
//   //   req.method === "GET" &&
//   //   req.user.branches.map((b) => "" + b.id).includes(id);
//   next();
// });
