const factory = require("./helpers/handlerFactory");
const BranchModel = require("../models/branchModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.getBranches = factory.getAll(BranchModel);
exports.getBranch = factory.getOne(BranchModel);
exports.createBranch = factory.createOne(BranchModel);
exports.updateBranch = factory.updateOne(BranchModel);
exports.makeDeletedBranch = factory.makeDeletedOne(BranchModel);
exports.deleteBranch = factory.deleteOne(BranchModel);

exports.assignCompany = catchAsync(async (req, res, next) => {
  req.body.company = process.env.COMPANY_ID;
  next();
});

exports.getOnlyBlance = catchAsync(async (req, res, next) => {
  req.query.fields = "balance -managers";
  next();
});

exports.getStudentCount = catchAsync(async (req, res, next) => {
  req.doc = await BranchModel.aggregate([
    {
      $lookup: {
        from: "groups",
        localField: "_id",
        foreignField: "branch",
        as: "groups",
      },
    },
    {
      $unwind: "$groups",
    },
    {
      $unwind: "$groups.students",
    },
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $group: {
        _id: "$_id", // Group by branch ID
        studentsCount: { $sum: 1 },
      },
    },
  ]);

  if (!req.doc.length) {
    return next(new AppError("No document found with that ID", 404));
  }

  req.doc = req.doc.at(0);

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
